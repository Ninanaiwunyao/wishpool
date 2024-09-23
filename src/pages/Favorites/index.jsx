import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import WishCard from "@/components/WishCard";

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

        setFavoriteWishes(wishes.filter(Boolean)); // 去除無效的願望
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user, db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-darkBlue min-h-screen p-8 ml-48">
      <h2 className="text-2xl font-bold text-cream mb-6 mt-32">我的收藏</h2>
      {favoriteWishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteWishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </div>
      ) : (
        <p className="text-white">沒有收藏的願望卡片。</p>
      )}
    </div>
  );
};

export default Favorites;
