import CustomAlert from "@/components/CustomAlert";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import angel from "./angel-stand.png";
import memberIcon from "./noIcon.jpg";

const Chat = () => {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSystemChat, setIsSystemChat] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const bottomRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    const fetchMessages = async () => {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const fetchedMessages = [];

        for (const docSnapshot of querySnapshot.docs) {
          const messageData = docSnapshot.data();

          let avatarUrl = "";
          if (messageData.senderId === "system") {
            avatarUrl = angel;
          } else {
            const userRef = doc(db, "users", messageData.senderId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              avatarUrl = userDoc.data().avatarUrl;
            }
          }

          fetchedMessages.push({
            id: docSnapshot.id,
            ...messageData,
            avatarUrl,
            approved: messageData.approved || false,
          });

          if (isActive && !messageData.readBy.includes(user.uid)) {
            const messageRef = doc(
              db,
              "chats",
              chatId,
              "messages",
              docSnapshot.id
            );
            await updateDoc(messageRef, {
              readBy: arrayUnion(user.uid),
            });
          }
        }
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    };

    fetchMessages();
    const handleTabClose = () => {
      isActive = false;
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      isActive = false;
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [chatId, db, user.uid]);
  useEffect(() => {
    const fetchChatInfo = async () => {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatDocRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setIsSystemChat(chatData.participants.includes("system"));
      }
    };

    fetchChatInfo();
  }, [chatId, db]);
  const sendSystemNotification = async (userId, messageContent) => {
    const db = getFirestore();

    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId)
      );
      const querySnapshot = await getDocs(q);

      let existingChat = null;

      querySnapshot.forEach((docSnapshot) => {
        const chatData = docSnapshot.data();
        if (
          chatData.participants.includes("system") &&
          chatData.participants.includes(userId) &&
          chatData.participants.length === 2
        ) {
          existingChat = { id: docSnapshot.id, ...chatData };
        }
      });

      if (existingChat) {
        await addDoc(collection(db, "chats", existingChat.id, "messages"), {
          senderId: "system",
          content: messageContent,
          timestamp: serverTimestamp(),
          messageType: "transaction",
          readBy: [],
        });
      } else {
        const newChatDocRef = await addDoc(chatsRef, {
          participants: ["system", userId],
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "chats", newChatDocRef.id, "messages"), {
          senderId: "system",
          content: messageContent,
          timestamp: serverTimestamp(),
          messageType: "transaction",
          readBy: [],
        });
      }
    } catch (error) {
      console.error("查詢或創建聊天時出錯：", error);
    }
  };
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || isSystemChat) return;
    const messagesRef = collection(db, "chats", chatId, "messages");

    try {
      await addDoc(messagesRef, {
        senderId: user.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
        messageType: "text",
        readBy: [],
      });
      setNewMessage("");
    } catch (error) {
      console.error("發送訊息失敗：", error);
    }
  };
  const handleApprove = async (dreamId, wishId, dreamerId, messageId) => {
    try {
      const wishDocRef = doc(db, "wishes", wishId);
      const wishDoc = await getDoc(wishDocRef);

      if (!wishDoc.exists()) {
        throw new Error("願望不存在");
      }

      const wishData = wishDoc.data();
      const wishOwnerId = wishData.creatorId;
      const amount = wishData.amount || 0;
      const userDocRef = doc(db, "users", dreamerId);
      const userDoc = await getDoc(userDocRef);
      const wishOwnerDocRef = doc(db, "users", wishOwnerId);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const newsupportedDreams =
          userData.supportedDreams !== undefined ? increment(1) : 1;

        await updateDoc(userDocRef, {
          coins: increment(amount),
          supportedDreams: newsupportedDreams,
          reputation: increment(50),
        });
      }
      const wishOwnerDoc = await getDoc(wishOwnerDocRef);
      if (wishOwnerDoc.exists()) {
        await updateDoc(wishOwnerDocRef, {
          reputation: increment(10),
        });
      }

      await updateDoc(wishDocRef, {
        status: "fulfilled",
      });

      const dreamDocRef = doc(db, "dreams", dreamId);
      await updateDoc(dreamDocRef, {
        status: "fulfilled",
        approved: "true",
      });
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        approved: true,
      });

      await sendSystemNotification(dreamerId, "您的圓夢證明已被核可，恭喜！");

      await addDoc(collection(db, "transactions"), {
        userId: dreamerId,
        amount: amount,
        type: "dream-completion",
        timestamp: serverTimestamp(),
        relatedId: dreamId,
      });
      await sendSystemNotification(
        dreamerId,
        `硬幣交易通知：您已獲得 ${amount} 個硬幣`
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, approved: true } : msg
        )
      );

      setAlertMessage("核可成功！");
    } catch (error) {
      console.error("核可失敗：", error);
    }
  };

  const handleReject = async (messageId, dreamerId, dreamId) => {
    try {
      if (!dreamId || !messageId) {
        throw new Error("缺少夢想 ID 或訊息 ID");
      }
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error("訊息文檔不存在");
      }
      await updateDoc(messageRef, {
        approved: false,
      });
      const dreamDocRef = doc(db, "dreams", dreamId);
      await updateDoc(dreamDocRef, {
        approved: "false",
      });

      await sendSystemNotification(
        dreamerId,
        "您的圓夢證明未被核可，請重新上傳。"
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, approved: false } : msg
        )
      );
      setAlertMessage("不核可操作已執行");
    } catch (error) {
      console.error("不核可操作失敗：", error);
    }
  };
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, where("readBy", "not-in", [user.uid]));

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        const messageRef = doc(db, "chats", chatId, "messages", docSnapshot.id);

        await updateDoc(messageRef, {
          readBy: arrayUnion(user.uid),
        });
      });
    };

    if (chatId && user) {
      markMessagesAsRead();
    }
  }, [chatId, user, db]);
  return (
    <div className=" h-screen p-8 flex flex-col md:ml-48">
      <h2 className="md:ml-24 text-2xl font-bold text-white mb-6 mt-16">
        聊天室
      </h2>
      <div className="md:ml-24 w-full md:w-4/5 flex flex-col flex-grow bg-white p-4 rounded-lg shadow-lg overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            {message.senderId !== user.uid && (
              <img
                src={message.avatarUrl || memberIcon}
                alt="頭像"
                className="w-10 h-10 rounded-full mr-4"
              />
            )}

            <div
              className={`p-2 rounded-lg max-w-md ${
                message.senderId === user.uid
                  ? "bg-lightBlue text-white"
                  : "bg-gray-300 text-darkBlue"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(message.timestamp?.toDate()).toLocaleString()}
              </p>
              {message.senderId === "system" &&
                message.messageType === "proof" && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      證明描述: {message.proofText}
                    </p>
                    {message.fileUrl && (
                      <img
                        src={message.fileUrl}
                        alt="證明圖片"
                        className="w-32 h-32 mt-2 object-cover"
                      />
                    )}
                    {message.approved == "pending" && (
                      <div className="flex space-x-4 mt-2">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() =>
                            handleApprove(
                              message.relatedId,
                              message.wishId,
                              message.dreamerId,
                              message.id
                            )
                          }
                        >
                          核可
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() =>
                            handleReject(
                              message.id,
                              message.dreamerId,
                              message.relatedId
                            )
                          }
                        >
                          不核可
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {message.senderId === user.uid && (
              <img
                src={message.avatarUrl || memberIcon}
                alt="頭像"
                className="w-10 h-10 rounded-full ml-4"
              />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center md:w-4/5 md:ml-24"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isSystemChat ? "系統通知不可回覆" : "輸入訊息..."}
          className="flex-grow p-2 rounded-l-lg"
          disabled={isSystemChat}
        />
        {!isSystemChat && (
          <button
            type="submit"
            className="bg-lightBlue text-white py-2 px-4 rounded-r-lg"
          >
            送出
          </button>
        )}
      </form>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default Chat;
