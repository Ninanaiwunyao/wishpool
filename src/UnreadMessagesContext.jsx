import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import angel from "./assets/angel-stand.png";
import memberIcon from "./assets/noIcon.jpg";

const UnreadMessagesContext = createContext();

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

export const UnreadMessagesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { chats, chatInfo, loading } = state;
  const [user, setUser] = useState(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);
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
    <UnreadMessagesContext.Provider
      value={{ unreadMessagesCount, chats, chatInfo }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};
UnreadMessagesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export const useUnreadMessages = () => {
  const { unreadMessagesCount } = useContext(UnreadMessagesContext);
  return unreadMessagesCount;
};
export const useChatDetails = () => {
  const { chats, chatInfo } = useContext(UnreadMessagesContext);
  return { chats, chatInfo };
};
