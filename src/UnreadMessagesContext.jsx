import { createContext, useContext, useEffect, useReducer } from "react";
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
  const { chats, chatInfo } = state;
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }

      const fetchChats = async () => {
        try {
          const chatsRef = collection(db, "chats");
          const q = query(
            chatsRef,
            where("participants", "array-contains", user.uid)
          );
          const unsubscribeChats = onSnapshot(q, async (querySnapshot) => {
            const fetchedChats = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            dispatch({ type: "SET_CHATS", payload: fetchedChats });

            const fetchPromises = fetchedChats.map(async (chat) => {
              const otherParticipantId = chat.participants.find(
                (participant) => participant !== user.uid
              );

              let userInfo = { userName: "Unknown" };
              if (otherParticipantId === "system") {
                userInfo = { userName: "系統通知" };
              } else {
                const userRef = doc(db, "users", otherParticipantId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                  userInfo = { userName: userDoc.data().userName || "Unknown" };
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
                        lastMessageDoc.data().timestamp?.toDate().getTime() ||
                        0,
                    };
                  }

                  const unreadMessagesQuery = query(
                    messagesRef,
                    orderBy("timestamp", "asc")
                  );
                  const allMessagesSnapshot = await getDocs(
                    unreadMessagesQuery
                  );
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
                      [chat.id]: { userInfo, lastMessage, unreadCount },
                    },
                  });
                }
              );
              return () => unsubscribeMessages();
            });
            await Promise.all(fetchPromises);
          });
          return () => unsubscribeChats();
        } catch (error) {
          console.error("Error fetching chats:", error);
        }
      };

      fetchChats();
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const unreadMessagesCount = chats.reduce((total, chat) => {
    const chatDetails = chatInfo[chat.id];
    const count = chatDetails?.unreadCount || 0;
    return total + count;
  }, 0);

  return (
    <UnreadMessagesContext.Provider value={{ unreadMessagesCount }}>
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
