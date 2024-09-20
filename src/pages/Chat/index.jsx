import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  increment,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import angel from "./angel-stand.png";

const Chat = () => {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSystemChat, setIsSystemChat] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const fetchedMessages = [];

        for (const docSnapshot of querySnapshot.docs) {
          const messageData = docSnapshot.data();

          let avatarUrl = "";
          if (messageData.senderId === "system") {
            // 对于系统消息，使用本地头像和预定义昵称
            avatarUrl = angel;
          } else {
            const userRef = doc(db, "users", messageData.senderId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              avatarUrl = userDoc.data().avatarUrl; // 假設用戶文檔中有 avatarUrl 字段
            }
          }

          fetchedMessages.push({
            id: docSnapshot.id,
            ...messageData,
            avatarUrl, // 加入發送者的頭像
            approved: messageData.approved || false,
          });
        }

        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [chatId, db]);
  useEffect(() => {
    const fetchChatInfo = async () => {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatDocRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // 檢查參與者是否包含 "system"
        setIsSystemChat(chatData.participants.includes("system"));
      }
    };

    fetchChatInfo();
  }, [chatId, db]);

  const sendMessageToDreamer = async (dreamerId, messageContent) => {
    const db = getFirestore();

    try {
      const chatsRef = collection(db, "chats");
      // 查詢是否存在 `system` 和 `dreamerId` 的聊天室
      const q = query(
        chatsRef,
        where("participants", "array-contains", dreamerId)
      );
      const querySnapshot = await getDocs(q);

      let existingChat = null;

      querySnapshot.forEach((docSnapshot) => {
        const chatData = docSnapshot.data();
        // 確保參與者為 `system` 和 `dreamerId` 且聊天室參與者數量為 2
        if (
          chatData.participants.includes("system") &&
          chatData.participants.includes(dreamerId) &&
          chatData.participants.length === 2
        ) {
          existingChat = { id: docSnapshot.id, ...chatData };
        }
      });

      if (existingChat) {
        // 如果找到現有聊天室，則使用此聊天室發送訊息
        console.log("找到現有聊天室:", existingChat.id);
        await addDoc(collection(db, "chats", existingChat.id, "messages"), {
          senderId: "system",
          content: messageContent,
          timestamp: serverTimestamp(),
          messageType: "proof",
        });
      } else {
        // 如果沒有找到聊天室，則創建新的聊天室
        console.log("未找到聊天室，創建新的聊天室");
        const newChatDocRef = await addDoc(chatsRef, {
          participants: ["system", dreamerId],
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "chats", newChatDocRef.id, "messages"), {
          senderId: "system",
          content: messageContent,
          timestamp: serverTimestamp(),
          messageType: "text",
        });
      }
    } catch (error) {
      console.error("查找或創建聊天時出錯：", error);
    }
  };

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
      });
      setNewMessage(""); // 發送成功後清空輸入框
    } catch (error) {
      console.error("發送訊息失敗：", error);
    }
  };
  const handleApprove = async (dreamId, wishId, dreamerId, messageId) => {
    try {
      // 增加圓夢者的 coins
      const userDocRef = doc(db, "users", dreamerId);
      await updateDoc(userDocRef, {
        coins: increment(50),
      });

      // 更新願望狀態為 "fulfilled"
      const wishDocRef = doc(db, "wishes", wishId);
      await updateDoc(wishDocRef, {
        status: "fulfilled",
      });

      const dreamDocRef = doc(db, "dreams", dreamId);
      await updateDoc(dreamDocRef, {
        status: "fulfilled",
      });
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        approved: true, // 標記為已核可
      });

      // 發送通知到聊天室
      await sendMessageToDreamer(dreamerId, "您的圓夢已被核可，恭喜！");

      // 記錄交易
      await addDoc(collection(db, "transactions"), {
        userId: dreamerId,
        amount: 50,
        type: "dream-completion",
        timestamp: serverTimestamp(),
        relatedId: dreamId,
      });

      alert("核可成功！");
    } catch (error) {
      console.error("核可失敗：", error);
    }
  };

  const handleReject = async (messageId) => {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        approved: false, // 標記為不核可
      });

      // 發送通知到聊天室
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: "system",
        content: "您的圓夢證明未被核可，請重新上傳。",
        timestamp: serverTimestamp(),
        messageType: "text",
      });

      alert("不核可操作已執行");
    } catch (error) {
      console.error("不核可操作失敗：", error);
    }
  };

  return (
    <div className="bg-darkBlue min-h-screen p-8 flex flex-col">
      <h2 className="ml-24 text-2xl font-bold text-cream mb-6 mt-16">聊天室</h2>
      <div className="ml-24 w-4/5 flex flex-col flex-grow bg-white p-4 rounded-lg shadow-lg overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            {/* 顯示發送者的頭像，放在訊息框的外側 */}
            {message.senderId !== user.uid && (
              <img
                src={message.avatarUrl || "https://via.placeholder.com/40"} // 如果頭像不存在顯示佔位圖
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
                    {!message.approved && (
                      <div className="flex space-x-4 mt-2">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() =>
                            handleApprove(
                              message.relatedId, // Dream ID
                              message.wishId, // Wish ID
                              message.dreamerId, // Dreamer ID
                              message.id
                            )
                          }
                        >
                          核可
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => handleReject(message.dreamerId)}
                        >
                          不核可
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* 發送者的頭像在訊息框外側 */}
            {message.senderId === user.uid && (
              <img
                src={message.avatarUrl || "https://via.placeholder.com/40"}
                alt="頭像"
                className="w-10 h-10 rounded-full ml-4"
              />
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center w-4/5 ml-24"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isSystemChat ? "系統通知不可回覆" : "輸入訊息..."}
          className="flex-grow p-2 rounded-l-lg"
          disabled={isSystemChat} // 禁用輸入框
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
    </div>
  );
};

export default Chat;
