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
import memberIcon from "./noIcon.jpg";

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
    <div className="bg-darkBlue min-h-screen py-8 flex flex-col items-center">
      <div className="w-3/5 mt-24">
        {/* 願望排行 */}
        <section className="mb-16">
          <h3 className="text-2xl font-semibold text-cream mb-16 text-center">
            最多收藏的願望
          </h3>
          <div className="flex flex-wrap gap-12 justify-center items-center md:flex-nowrap md:justify-center">
            {topWishes.length >= 3 && (
              <>
                {/* 第二名 */}
                <div key={topWishes[1].id} className="order-2 md:order-1">
                  <div className="relative">
                    <div className="z-10 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow text-darkBlue font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      #2
                    </div>
                    <WishCard
                      wish={topWishes[1]}
                      showFavoriteButton={false}
                      className="shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </div>
                </div>

                {/* 第一名 */}
                <div key={topWishes[0].id} className="order-1 md:order-2">
                  <div className="scale-100 md:scale-110 relative">
                    <div className="z-10 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow text-darkBlue font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      #1
                    </div>
                    <WishCard
                      wish={topWishes[0]}
                      showFavoriteButton={false}
                      className="shadow-md hover:shadow-lg transition-all duration-300 border-4 border-yellow"
                    />
                  </div>
                </div>

                {/* 第三名 */}
                <div key={topWishes[2].id} className="order-3 md:order-3">
                  <div className="relative">
                    <div className="z-10 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow text-darkBlue font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      #3
                    </div>
                    <WishCard
                      wish={topWishes[2]}
                      showFavoriteButton={false}
                      className="shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 圓夢次數排行 */}
        <section>
          <h3 className="text-2xl font-semibold text-cream mb-16 text-center">
            圓夢次數最多的用戶
          </h3>
          <div className="flex flex-wrap gap-24 items-start justify-center md:flex-nowrap">
            {topDreamers.length >= 3 && (
              <>
                {/* 第一名 */}
                <div key={topDreamers[0].id} className="order-1 md:order-2">
                  <div className="scale-100 md:scale-125 relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg flex items-center justify-between transition-all duration-300 border-l-4 border-yellow w-64">
                    <div className="absolute -top-8 left-0 bg-yellow text-darkBlue font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      #1
                    </div>
                    <img
                      src={topDreamers[0].avatarUrl || memberIcon}
                      alt={topDreamers[0].userName}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="text-xl font-semibold">
                        {topDreamers[0].userName}
                      </h4>
                      <p className="text-gray-600">
                        完成夢想數：{topDreamers[0].supportedDreams}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 第二名 */}
                <div key={topDreamers[1].id} className="order-2 md:order-1">
                  <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg flex items-center justify-between transition-all duration-300 w-64">
                    <div className="absolute -top-8 left-0 bg-yellow text-darkBlue font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      #2
                    </div>
                    <img
                      src={topDreamers[1].avatarUrl || memberIcon}
                      alt={topDreamers[1].userName}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="text-xl font-semibold">
                        {topDreamers[1].userName}
                      </h4>
                      <p className="text-gray-600">
                        完成夢想數：{topDreamers[1].supportedDreams}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 第三名 */}
                <div key={topDreamers[2].id} className="order-3 md:order-3">
                  <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg flex items-center justify-between transition-all duration-300 w-64">
                    <div className="absolute -top-8 left-0 bg-yellow text-darkBlue font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      #3
                    </div>
                    <img
                      src={topDreamers[2].avatarUrl || memberIcon}
                      alt={topDreamers[2].userName}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="text-xl font-semibold">
                        {topDreamers[2].userName}
                      </h4>
                      <p className="text-gray-600">
                        完成夢想數：{topDreamers[2].supportedDreams}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RankingPage;
