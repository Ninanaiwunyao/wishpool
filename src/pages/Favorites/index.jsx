import WishCard from "@/components/WishCard";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import angelBird from "./angel-bird.png";

const Favorites = () => {
  const [favoriteWishes, setFavoriteWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const favoriteWishIds = userDoc.data().favorites || [];
        const wishes = await Promise.all(
          favoriteWishIds.map(async (wishId) => {
            const wishRef = doc(db, "wishes", wishId);
            const wishDoc = await getDoc(wishRef);
            if (wishDoc.exists()) {
              return { id: wishId, ...wishDoc.data() };
            }
            return null;
          })
        );

        setFavoriteWishes(wishes.filter(Boolean));
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user, db]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className="p-8 md:mt-28 mt-16 md:ml-64 min-h-screen relative flex flex-col items-center md:items-start">
      <h2 className="text-2xl font-bold text-white md:mb-6 ">我的收藏</h2>
      <div className="h-fit flex-grow flex items-start md:justify-start justify-center mt-12 md:mt-0">
        {favoriteWishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-center justify-center">
            {favoriteWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        ) : (
          <p className="text-white">沒有收藏的願望卡片。</p>
        )}
      </div>
      <motion.div
        animate={{ y: ["0%", "-10%", "0%"] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="hidden md:block absolute bottom-36 right-0 h-72"
      >
        <img src={angelBird} alt="" className="h-full" />
      </motion.div>
    </div>
  );
};

export default Favorites;
