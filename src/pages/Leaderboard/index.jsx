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
import backgroundImage from "./leaderboardBG.png";

const Leaderboard = () => {
  const [topWishes, setTopWishes] = useState([]);
  const [topDreamers, setTopDreamers] = useState([]);
  const [activeTab, setActiveTab] = useState("wishes");
  const [isMdOrAbove, setIsMdOrAbove] = useState(window.innerWidth >= 1945);
  const [isSmOrBelow, setIsSmOrBelow] = useState(window.innerWidth < 1245);
  const db = getFirestore();

  useEffect(() => {
    const fetchTopWishes = async () => {
      const wishesRef = collection(db, "wishes");
      const q = query(
        wishesRef,
        where("likeCount", ">", 0),
        orderBy("likeCount", "desc"),
        limit(3)
      );
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
        limit(3)
      );
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
  useEffect(() => {
    const handleResize = () => {
      setIsMdOrAbove(window.innerWidth >= 1945);
      setIsSmOrBelow(window.innerWidth < 1245);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="bg-darkBlue min-h-screen py-8 flex flex-col items-center"
      style={{
        backgroundImage: isSmOrBelow ? "none" : `url(${backgroundImage})`,
        backgroundSize: "contain",
        backgroundPosition: isMdOrAbove ? "" : "center 250px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-3/5 mt-24 mb-72">
        <div className="flex flex-col md:flex-row justify-center mb-8">
          <button
            className={`px-6 py-3 mx-2 rounded-md text-white font-semibold transition-colors ${
              activeTab === "wishes"
                ? "bg-lightBlue"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            onClick={() => setActiveTab("wishes")}
          >
            最多收藏的願望
          </button>
          <button
            className={`px-6 py-3 mx-2 rounded-md text-white font-semibold transition-colors ${
              activeTab === "dreamers"
                ? "bg-lightBlue"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            onClick={() => setActiveTab("dreamers")}
          >
            圓夢次數最多的用戶
          </button>
        </div>
        {activeTab === "wishes" && (
          <section className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-16 text-center">
              最多收藏的願望
            </h3>
            <div className="flex flex-wrap gap-12 justify-center items-center md:flex-nowrap md:justify-center">
              {topWishes.length >= 3 && (
                <>
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
        )}
        {activeTab === "dreamers" && (
          <section>
            <h3 className="text-2xl font-semibold text-white mb-16 text-center">
              圓夢次數最多的用戶
            </h3>
            <div className="flex flex-wrap gap-24 items-start justify-center md:flex-nowrap mb-72">
              {topDreamers.length >= 3 && (
                <>
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
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
