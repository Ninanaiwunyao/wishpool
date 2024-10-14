import { useEffect, useReducer } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import angel from "./angel-stand.png";
import memberIcon from "./noIcon.jpg";
import { motion } from "framer-motion";
import angelMail from "./angel-mail.png";
import MemberPage from "@/pages/MemberPage";

const initialState = {
  chats: [],
  chatInfo: {},
  loading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_CHATS": {
      return { ...state, chats: action.payload, loading: false };
    }
    case "UPDATE_CHAT_INFO": {
      const updatedChatInfo = { ...state.chatInfo, ...action.payload };

      const sortedChats = [...state.chats].sort((a, b) => {
        const lastMessageATime = new Date(
          updatedChatInfo[a.id]?.lastMessage.timestamp || 0
        ).getTime();
        const lastMessageBTime = new Date(
          updatedChatInfo[b.id]?.lastMessage.timestamp || 0
        ).getTime();
        return lastMessageBTime - lastMessageATime;
      });

      return { ...state, chatInfo: updatedChatInfo, chats: sortedChats };
    }
    case "SET_LOADING": {
      return { ...state, loading: action.payload };
    }
    default:
      return state;
  }
};

const Messages = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chats, chatInfo, loading } = state;
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      try {
        const chatsRef = collection(db, "chats");
        const q = query(
          chatsRef,
          where("participants", "array-contains", user.uid)
        );
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const fetchedChats = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          dispatch({ type: "SET_CHATS", payload: fetchedChats });

          const fetchPromises = fetchedChats.map(async (chat) => {
            const otherParticipantId = chat.participants.find(
              (participant) => participant !== user.uid
            );

            let userInfo = { userName: "Unknown", avatarUrl: "" };
            if (otherParticipantId === "system") {
              userInfo = {
                userName: "系統通知",
                avatarUrl: angel,
              };
            } else {
              const userRef = doc(db, "users", otherParticipantId);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                userInfo = {
                  userName: userDoc.data().userName || "Unknown",
                  avatarUrl: userDoc.data().avatarUrl || memberIcon,
                };
              }
            }

            const messagesRef = collection(db, "chats", chat.id, "messages");
            const lastMessageQuery = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );

            const unsubscribeMessages = onSnapshot(
              lastMessageQuery,
              async (snapshot) => {
                let lastMessage = { content: "無訊息", timestamp: null };
                if (!snapshot.empty) {
                  const lastMessageDoc = snapshot.docs[0];
                  lastMessage = {
                    content: lastMessageDoc.data().content,
                    timestamp:
                      lastMessageDoc.data().timestamp?.toDate().getTime() || 0,
                  };
                }

                const unreadMessagesQuery = query(
                  messagesRef,
                  orderBy("timestamp", "asc")
                );

                const allMessagesSnapshot = await getDocs(unreadMessagesQuery);
                const unreadMessages = allMessagesSnapshot.docs.filter(
                  (doc) => {
                    const messageData = doc.data();

                    if (messageData.senderId === user.uid) {
                      return false;
                    }

                    return (
                      !messageData.readBy ||
                      !messageData.readBy.includes(user.uid)
                    );
                  }
                );

                const unreadCount = unreadMessages.length;

                dispatch({
                  type: "UPDATE_CHAT_INFO",
                  payload: {
                    [chat.id]: {
                      userInfo,
                      lastMessage,
                      unreadCount,
                    },
                  },
                });
              }
            );

            return () => unsubscribeMessages();
          });

          await Promise.all(fetchPromises);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [user, db]);
  const unreadMessagesCount = chats.reduce((total, chat) => {
    const chatDetails = chatInfo[chat.id];
    return total + (chatDetails?.unreadCount || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen relative">
        <div className="flex flex-col items-center space-y-6">
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-6 bg-yellow rounded-full animate-bounce"></div>
            <div className="w-6 h-6 bg-lightBlue rounded-full animate-bounce delay-100"></div>
            <div className="w-6 h-6 bg-white rounded-full animate-bounce delay-200"></div>
          </motion.div>

          <p className="text-white text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" p-8 md:ml-40 h-screen mt-28">
        <h2 className="text-2xl font-bold text-white mb-6 md:ml-24 ">聊天室</h2>
        {chats.length > 0 ? (
          <div className="flex flex-col md:w-4/5 w-full md:ml-24">
            {chats.map((chat) => {
              const chatDetails = chatInfo[chat.id];
              return (
                <div
                  key={chat.id}
                  className="bg-white p-4 shadow-md cursor-pointer border-b-4"
                  onClick={() => navigate(`/memberpage/chat/${chat.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {chatDetails ? (
                        <>
                          <img
                            src={chatDetails.userInfo.avatarUrl}
                            alt="头像"
                            className="w-10 h-10 rounded-full mr-4"
                          />
                          <div>
                            <p className="text-darkBlue font-bold">
                              {chatDetails.userInfo.userName}
                            </p>
                            <p className="text-gray-500">
                              {chatDetails.lastMessage.content.length > 30
                                ? chatDetails.lastMessage.content.slice(0, 30) +
                                  "..."
                                : chatDetails.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(
                                chatDetails.lastMessage.timestamp
                              ).toLocaleString("zh-TW", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })}
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-darkBlue">無訊息</p>
                      )}
                    </div>
                    {chatDetails?.unreadCount > 0 && (
                      <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                        {chatDetails.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white ml-24">目前沒有聊天室。</p>
        )}
        <motion.div
          animate={{ y: ["0%", "-10%", "0%"] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className=" hidden md:block absolute bottom-36 right-0"
        >
          <img src={angelMail} alt="" className="h-full" />
        </motion.div>
      </div>
      <MemberPage unreadMessagesCount={unreadMessagesCount} />
    </>
  );
};

export default Messages;
