import CustomAlert from "@/components/CustomAlert";
import { useWishes } from "@/WishesContext";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const WishCardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { wishes, loading } = useWishes();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);

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

        if (endDate < today) {
          await deleteDoc(dreamDoc.ref);

          const chatRef = doc(db, "chats", dreamData.chatId);
          await deleteDoc(chatRef);

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

          const wishRef = doc(db, "wishes", dreamData.wishId);
          await updateDoc(wishRef, {
            status: "open",
          });
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
            if (userData.favorites.includes(wish.id)) {
              setIsFavorited(true);
            }
          }
        }
      });
    }
  }, [user, wish, db]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-darkBlue">
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

          {/* Loading Message */}
          <p className="text-white text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darkBlue">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <img
            src="https://via.placeholder.com/150?text=Wish+Not+Found"
            alt="No wish found"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">找不到願望</h2>
          <p className="text-gray-600 mb-6">
            抱歉，我們無法找到與此ID匹配的願望。請檢查ID並重試。
          </p>
          <button
            onClick={() => navigate("/wishPool")}
            className="bg-lightBlue text-white py-2 px-4 rounded hover:bg-darkBlue transition duration-300"
          >
            回到願望池
          </button>
        </div>
      </div>
    );
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
          await updateDoc(userRef, {
            favorites: arrayRemove(wish.id),
          });
          await updateDoc(wishRef, {
            likeCount: increment(-1),
          });
          await updateDoc(creatorRef, {
            reputation: increment(-5),
          });
          setIsFavorited(false);
        } else {
          await updateDoc(userRef, {
            favorites: arrayUnion(wish.id),
          });
          await updateDoc(wishRef, {
            likeCount: increment(1),
          });
          await updateDoc(creatorRef, {
            reputation: increment(5),
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
        return docSnapshot.id;
      }
    }
    return null;
  };
  const handleDreamClick = () => {
    setShowForm(true);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedEndDate = new Date(endDate);
    if (selectedEndDate < today) {
      setAlertMessage("截止日期不能早於今天！");
      return;
    }
    try {
      const existingChatId = await checkIfChatExists(wish.creatorId, user.uid);

      let chatDocRef;

      if (existingChatId) {
        chatDocRef = doc(db, "chats", existingChatId);
      } else {
        chatDocRef = await addDoc(collection(db, "chats"), {
          participants: [wish.creatorId, user.uid],
        });
      }

      await addDoc(collection(db, "dreams"), {
        wishId: wish.id,
        dreamerId: user.uid,
        wishOwnerId: wish.creatorId,
        startDate: serverTimestamp(),
        endDate: new Date(endDate),
        status: "in-progress",
        chatId: chatDocRef.id,
      });

      const wishRef = doc(db, "wishes", wish.id);
      await updateDoc(wishRef, {
        status: "accepted",
      });

      const messagesRef = collection(db, "chats", chatDocRef.id, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        content: "嗨！我來幫你圓夢了！",
        timestamp: serverTimestamp(),
        messageType: "text",
        readBy: [],
      });

      setAlertMessage("圓夢已開始，聊天室已建立！");
      setShowForm(false);
      setTimeout(() => {
        navigate(`/memberPage/chat/${chatDocRef.id}`);
      }, 2000);
    } catch (error) {
      console.error("無法創建 dream：", error);
      setAlertMessage("圓夢創建失敗！");
    }
  };

  return (
    <div className="bg-darkBlue min-h-screen flex flex-col items-center p-8 ">
      <div
        key={wish.id}
        className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-2xl flex flex-col md:flex-row mt-32"
      >
        <div className="flex-shrink-0">
          <img
            src={wish.imageUrl}
            alt={`${wish.title} image`}
            className="h-48 rounded-lg object-cover"
          />
        </div>

        <div className="text-white ml-6 md:mt-0 mt-6">
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
                className="bg-yellow text-lightBlue font-semibold rounded-full px-6 py-2 hover:bg-darkYellow"
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
        <div className="bg-white p-4 rounded shadow-lg mt-4 w-64 flex flex-col justify-center items-center">
          <h3 className="text-lg font-bold mb-2">選擇截止時間</h3>
          <form onSubmit={handleFormSubmit}>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="border p-2 rounded mb-4"
            />
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-lightBlue text-white py-2 px-4 rounded"
              >
                確認
              </button>
              <button
                type="button"
                className="ml-2 bg-orange-500 text-white py-2 px-4 rounded"
                onClick={() => setShowForm(false)}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};
export default WishCardDetail;
