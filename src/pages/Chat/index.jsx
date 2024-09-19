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
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Chat = () => {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isApproved, setIsApproved] = useState(false);
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
          const userRef = doc(db, "users", messageData.senderId);
          const userDoc = await getDoc(userRef);

          let avatarUrl = "";
          if (userDoc.exists()) {
            avatarUrl = userDoc.data().avatarUrl; // 假設用戶文檔中有 avatarUrl 字段
          }

          fetchedMessages.push({
            id: docSnapshot.id,
            ...messageData,
            avatarUrl, // 加入發送者的頭像
          });
        }

        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [chatId, db]);
  const sendMessageToDreamer = async (dreamerId, messageContent) => {
    const db = getFirestore();

    try {
      // 定位到 chats 子集合，查找或創建夢者與 system 的聊天
      const chatDocRef = doc(db, "chats", dreamerId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        // 如果聊天文檔不存在，則創建它
        await setDoc(chatDocRef, {
          participants: ["system", dreamerId],
          createdAt: serverTimestamp(),
        });
      }

      // 發送訊息到該聊天文檔的 messages 子集合中
      const messagesRef = collection(db, "chats", dreamerId, "messages");
      await addDoc(messagesRef, {
        senderId: "system",
        content: messageContent,
        timestamp: serverTimestamp(),
        messageType: "text",
      });

      console.log("訊息已發送到圓夢者的聊天中！");
    } catch (error) {
      console.error("發送訊息失敗：", error);
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

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
  const handleApprove = async (dreamId, wishId, dreamerId) => {
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
      setIsApproved(true);
    } catch (error) {
      console.error("核可失敗：", error);
    }
  };

  const handleReject = async () => {
    try {
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
                    {!isApproved && (
                      <div className="flex space-x-4 mt-2">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() =>
                            handleApprove(
                              message.relatedId, // Dream ID
                              message.wishId, // Wish ID
                              message.dreamerId // Dreamer ID
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
          placeholder="輸入訊息..."
          className="flex-grow p-2 rounded-l-lg"
        />
        <button
          type="submit"
          className="bg-lightBlue text-white py-2 px-4 rounded-r-lg"
        >
          送出
        </button>
      </form>
    </div>
  );
};

export default Chat;
