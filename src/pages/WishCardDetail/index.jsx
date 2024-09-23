import { useNavigate } from "react-router-dom";
import { useWishes } from "@/WishesContext";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getFirestore,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  serverTimestamp,
  deleteDoc,
  getDocs,
  query,
  where,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const WishCardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { wishes, loading } = useWishes();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [endDate, setEndDate] = useState("");
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const wish = wishes.find((wish) => wish.id === id);
  useEffect(() => {
    const checkExpiredDreams = async () => {
      const dreamsSnapshot = await getDocs(collection(db, "dreams"));
      const today = new Date();

      dreamsSnapshot.forEach(async (dreamDoc) => {
        const dreamData = dreamDoc.data();
        const endDate = dreamData.endDate.toDate();

        // 如果截止日期已過
        if (endDate < today) {
          console.log(`Dream ${dreamDoc.id} 已過期，正在刪除...`);

          // 刪除該 dream 文檔
          await deleteDoc(dreamDoc.ref);

          // 刪除對應的聊天室
          const chatRef = doc(db, "chats", dreamData.chatId);
          await deleteDoc(chatRef);

          // 刪除聊天室中的消息
          const messagesRef = collection(
            db,
            "chats",
            dreamData.chatId,
            "messages"
          );
          const messagesSnapshot = await getDocs(messagesRef);
          messagesSnapshot.forEach(async (messageDoc) => {
            await deleteDoc(messageDoc.ref);
          });

          // 更新對應的願望狀態
          const wishRef = doc(db, "wishes", dreamData.wishId);
          await updateDoc(wishRef, {
            status: "open",
          });

          console.log(
            `Dream ${dreamDoc.id} 已刪除，對應的 wish 狀態已更新為 open。`
          );
        }
      });
    };

    checkExpiredDreams();
  }, [db]);
  useEffect(() => {
    if (user && wish) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          if (userData.favorites && Array.isArray(userData.favorites)) {
            // 檢查 favorites 是否包含 wish.id
            if (userData.favorites.includes(wish.id)) {
              setIsFavorited(true);
            }
          }
        }
      });
    }
  }, [user, wish, db]);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!wish) {
    return <p>No wish found with the given ID.</p>;
  }
  const openStatus = wish.status === "open";
  const isOwner = user && wish.creatorId === user.uid;
  const tags = [
    { tag_category: "愛情", href: "/category?category=愛情" },
    { tag_category: "學業", href: "/category?category=學業" },
    { tag_category: "生活", href: "/category?category=生活" },
    { tag_category: "工作", href: "/category?category=工作" },
    { tag_category: "興趣", href: "/category?category=興趣" },
    { tag_category: "家庭", href: "/category?category=家庭" },
    { tag_category: "公益", href: "/category?category=公益" },
    { tag_category: "人際", href: "/category?category=人際" },
  ];

  const handleTagClick = (tag) => {
    const tagItem = tags.find((comp) => comp.tag_category === tag);
    if (tagItem) {
      navigate(tagItem.href);
    } else {
      console.error("找不到分類:", tag);
    }
  };
  const handleToggleFavorite = async () => {
    const userRef = doc(db, "users", user.uid);
    const wishRef = doc(db, "wishes", wish.id);
    const creatorRef = doc(db, "users", wish.creatorId);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hasFavorited = userData.favorites?.includes(wish.id);

        if (hasFavorited) {
          // 如果已收藏，則移除收藏，並減少 likeCount
          await updateDoc(userRef, {
            favorites: arrayRemove(wish.id),
          });
          await updateDoc(wishRef, {
            likeCount: increment(-1), // 減少 likeCount
          });
          await updateDoc(creatorRef, {
            reputation: increment(-5), // 減少創建者的 reputation
          });
          setIsFavorited(false);
        } else {
          // 如果未收藏，則添加收藏，並增加 likeCount
          await updateDoc(userRef, {
            favorites: arrayUnion(wish.id),
          });
          await updateDoc(wishRef, {
            likeCount: increment(1), // 增加 likeCount
          });
          await updateDoc(creatorRef, {
            reputation: increment(5), // 增加創建者的 reputation
          });
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error("更新收藏狀態失敗:", error);
    }
  };

  const checkIfChatExists = async (creatorId, dreamerId) => {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", creatorId)
    );
    const querySnapshot = await getDocs(q);

    for (const docSnapshot of querySnapshot.docs) {
      const chatData = docSnapshot.data();
      if (
        chatData.participants.length === 2 &&
        chatData.participants.includes(dreamerId)
      ) {
        // 已存在這兩個人的聊天室，返回聊天室 ID
        return docSnapshot.id;
      }
    }
    return null;
  };
  const handleDreamClick = () => {
    setShowForm(true); // 顯示表單
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 確保時間部分被設定為午夜（避免時區或小時的問題）
    const selectedEndDate = new Date(endDate);
    if (selectedEndDate < today) {
      alert("截止日期不能早於今天！");
      return;
    }
    try {
      const existingChatId = await checkIfChatExists(wish.creatorId, user.uid);

      let chatDocRef;

      if (existingChatId) {
        console.log("已找到現有聊天室，使用現有聊天室:", existingChatId);
        chatDocRef = doc(db, "chats", existingChatId);
      } else {
        // 如果沒有找到聊天室，則創建新的聊天室
        console.log("未找到聊天室，創建新的聊天室");
        chatDocRef = await addDoc(collection(db, "chats"), {
          participants: [wish.creatorId, user.uid], // 許願者和圓夢者
        });
      }

      // 然後創建新的 dream 文檔並將 chatId 存入其中
      await addDoc(collection(db, "dreams"), {
        wishId: wish.id,
        dreamerId: user.uid,
        wishOwnerId: wish.creatorId,
        startDate: serverTimestamp(),
        endDate: new Date(endDate), // 將選擇的截止日期轉換為日期對象
        status: "in-progress",
        chatId: chatDocRef.id, // 儲存 chatId
      });

      // 更新 wish 文檔的狀態
      const wishRef = doc(db, "wishes", wish.id);
      await updateDoc(wishRef, {
        status: "accepted",
      });

      // 為聊天室創建一個歡迎訊息
      const messagesRef = collection(db, "chats", chatDocRef.id, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        content: "嗨！我來幫你圓夢了！",
        timestamp: serverTimestamp(),
        messageType: "text",
        readBy: [],
      });

      // 導航到聊天室頁面
      navigate(`/memberPage/chat/${chatDocRef.id}`);
      // 設置自動刪除功能：根據截止日期設定一個時間，在截止日期後刪除聊天室

      alert("圓夢已開始，聊天室已建立！");
      setShowForm(false); // 隱藏表單
    } catch (error) {
      console.error("無法創建 dream：", error);
      alert("圓夢創建失敗！");
    }
  };

  return (
    <div className="bg-darkBlue min-h-[calc(100vh-144px)] flex flex-col items-center p-8 ">
      <div
        key={wish.id}
        className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-2xl flex mt-32"
      >
        <div className="flex-shrink-0">
          <img
            src={wish.imageUrl}
            alt={`${wish.title} image`}
            className="w-40 h-40 rounded-lg object-cover"
          />
        </div>

        <div className="text-white ml-6">
          <h3 className="text-xl font-bold mb-4">願望主旨</h3>
          <p className="mb-6">{wish.title}</p>

          <h3 className="text-xl font-bold mb-4">願望內容</h3>
          <p className="mb-6">{wish.description}</p>

          <div className="flex space-x-2 mb-6">
            {wish.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-white text-black rounded-full px-4 py-1"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {!isOwner && openStatus && (
              <button
                className="bg-yellow-300 text-primaryBlue font-semibold rounded-full px-6 py-2 hover:bg-yellow-400"
                onClick={handleDreamClick}
              >
                圓夢
              </button>
            )}
            <button
              className="bg-transparent text-white text-2xl"
              onClick={handleToggleFavorite}
            >
              {isFavorited ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="bg-white p-4 rounded shadow-lg mt-4">
          <h3 className="text-lg font-bold mb-2">選擇截止時間</h3>
          <form onSubmit={handleFormSubmit}>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="border p-2 rounded mb-4"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              確認
            </button>
            <button
              type="button"
              className="ml-2 bg-red-500 text-white py-2 px-4 rounded"
              onClick={() => setShowForm(false)}
            >
              取消
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default WishCardDetail;
