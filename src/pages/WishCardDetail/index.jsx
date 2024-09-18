import { useNavigate } from "react-router-dom";
import { useWishes } from "@/WishesContext";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const WishCardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { wishes, loading } = useWishes();
  const [isFavorited, setIsFavorited] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const wish = wishes.find((wish) => wish.id === id);

  useEffect(() => {
    if (user && wish) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnapshot) => {
        if (
          docSnapshot.exists() &&
          docSnapshot.data().favorites.includes(wish.id)
        ) {
          setIsFavorited(true);
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
    try {
      if (isFavorited) {
        // 如果已收藏，則移除收藏
        await updateDoc(userRef, {
          favorites: arrayRemove(wish.id),
        });
        setIsFavorited(false);
      } else {
        // 如果未收藏，則添加收藏
        await updateDoc(userRef, {
          favorites: arrayUnion(wish.id),
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("更新收藏狀態失敗:", error);
    }
  };

  return (
    <div className="bg-darkblue min-h-screen flex flex-col items-center p-8 mt-32">
      <div
        key={wish.id}
        className="bg-gray-800 rounded-xl shadow-lg mt-10 p-8 w-full max-w-2xl flex"
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
            <button className="bg-yellow-300 text-primaryBlue font-semibold rounded-full px-6 py-2 hover:bg-yellow-400">
              圓夢
            </button>
            <button
              className="bg-transparent text-white text-2xl"
              onClick={handleToggleFavorite}
            >
              {isFavorited ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WishCardDetail;
