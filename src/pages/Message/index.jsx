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
import angel from "./angel-stand.png"; // 系統通知頭像

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

      // 創建新的數組副本並基於時間戳排序
      const sortedChats = [...state.chats].sort((a, b) => {
        const lastMessageATime = new Date(
          updatedChatInfo[a.id]?.lastMessage.timestamp || 0
        ).getTime();
        const lastMessageBTime = new Date(
          updatedChatInfo[b.id]?.lastMessage.timestamp || 0
        ).getTime();
        return lastMessageBTime - lastMessageATime; // 最新訊息排在最上面
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

          // 並行查詢所有參與者的資訊和最後一條訊息
          const fetchPromises = fetchedChats.map(async (chat) => {
            const otherParticipantId = chat.participants.find(
              (participant) => participant !== user.uid
            );

            // 獲取參與者信息
            let userInfo = { userName: "Unknown", avatarUrl: "" };
            if (otherParticipantId === "system") {
              userInfo = {
                userName: "系統通知",
                avatarUrl: angel,
              }; // 系統頭像
            } else {
              const userRef = doc(db, "users", otherParticipantId);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                userInfo = {
                  userName: userDoc.data().userName || "Unknown",
                  avatarUrl:
                    userDoc.data().avatarUrl ||
                    "https://via.placeholder.com/40",
                };
              }
            }

            // 監聽訊息變化
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

                // 獲取未讀訊息
                const unreadMessagesQuery = query(
                  messagesRef,
                  orderBy("timestamp", "asc") // 根據需要排序
                );

                const allMessagesSnapshot = await getDocs(unreadMessagesQuery);
                const unreadMessages = allMessagesSnapshot.docs.filter(
                  (doc) => {
                    const messageData = doc.data();

                    // 自己發送的訊息不計算為未讀
                    if (messageData.senderId === user.uid) {
                      return false;
                    }

                    // 如果是對方發送的訊息，並且 readBy 不包含自己的 ID
                    return (
                      !messageData.readBy ||
                      !messageData.readBy.includes(user.uid)
                    );
                  }
                );

                const unreadCount = unreadMessages.length; // 記錄未讀訊息數

                // 更新 chatInfo
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

            return () => unsubscribeMessages(); // 清除訊息監聽
          });

          // 等待所有參與者和訊息資訊查詢完成
          await Promise.all(fetchPromises);
        });

        return () => unsubscribe(); // 清除聊天監聽
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [user, db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-darkBlue min-h-screen p-8">
      <h2 className="text-2xl font-bold text-cream mb-6 mt-32 ml-24">聊天室</h2>
      {chats.length > 0 ? (
        <div className="flex flex-col w-4/5 ml-24">
          {chats.map((chat) => {
            const chatDetails = chatInfo[chat.id];
            return (
              <div
                key={chat.id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer border-b-4"
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
                            {chatDetails.lastMessage.timestamp}
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
        <p className="text-white">目前沒有聊天室。</p>
      )}
    </div>
  );
};

export default Messages;
