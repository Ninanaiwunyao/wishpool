import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import WishCard from "@/components/WishCard";

const RankingPage = () => {
  const [topWishes, setTopWishes] = useState([]);
  const [topDreamers, setTopDreamers] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchTopWishes = async () => {
      const wishesRef = collection(db, "wishes");
      const q = query(
        wishesRef,
        where("likeCount", ">", 0),
        orderBy("likeCount", "desc"),
        limit(10)
      ); // 按 likeCount 降序排列，取前 10
      const querySnapshot = await getDocs(q);
      const wishes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopWishes(wishes);
    };

    const fetchTopDreamers = async () => {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("supportedDreams", ">", 0),
        orderBy("supportedDreams", "desc"),
        limit(10)
      ); // 按完成夢想次數降序排列，取前 10
      const querySnapshot = await getDocs(q);
      const dreamers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopDreamers(dreamers);
    };

    fetchTopWishes();
    fetchTopDreamers();
  }, [db]);

  return (
    <div className="bg-darkBlue min-h-[calc(100vh-144px)] p-8 flex flex-col items-center">
      <div className="w-3/5 mt-24">
        <h2 className="text-3xl font-bold text-cream mb-6">排行榜</h2>

        {/* 願望排行 */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold text-cream mb-4">
            最多收藏的願望
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topWishes.map(
              (wish) =>
                wish.status == "open" && (
                  <WishCard
                    key={wish.id}
                    wish={wish} // 傳入 wish 物件作為 prop
                    showFavoriteButton={false} // 根據需求可以選擇顯示或隱藏收藏按鈕
                  />
                )
            )}
          </div>
        </section>
        {/* 圓夢次數排行 */}
        <section>
          <h3 className="text-2xl font-semibold text-cream mb-4">
            圓夢次數最多的用戶
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDreamers.map((dreamer) => (
              <div
                key={dreamer.id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center hover:shadow-lg"
              >
                <img
                  src={dreamer.avatarUrl || "https://via.placeholder.com/100"}
                  alt={dreamer.userName}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-xl font-semibold">{dreamer.userName}</h4>
                  <p className="text-gray-600">
                    完成夢想數：{dreamer.supportedDreams}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RankingPage;
