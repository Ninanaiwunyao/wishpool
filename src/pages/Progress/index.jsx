import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProofUploadModal from "@/components/ProofUploadModal";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import WishCardWithId from "@/components/WishCardWithId";
import moment from "moment";

const Progress = () => {
  const [inProgressDreams, setInProgressDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInProgressDreams = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const dreamsRef = collection(db, "dreams");
      const q = query(
        dreamsRef,
        where("dreamerId", "==", user.uid),
        where("status", "==", "in-progress")
      );
      const querySnapshot = await getDocs(q);

      const fetchedDreams = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInProgressDreams(fetchedDreams);
      setLoading(false);
    };

    fetchInProgressDreams();
  }, [user, db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const calculateProgress = (startDate, endDate) => {
    const now = moment();
    const start = moment(startDate.toDate()); // 將 startDate 轉換為 Date
    const end = moment(endDate.toDate()); // 將 endDate 轉換為 Date
    const totalDays = moment.duration(end.diff(start)).asDays(); // 總天數
    const daysRemaining = moment.duration(end.diff(now)).asDays(); // 剩餘天數
    const progress = Math.max(
      0,
      Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)
    ); // 百分比進度

    return { daysRemaining, progress };
  };
  const handleUploadProof = (dream) => {
    setSelectedDream(dream);
    setShowUploadModal(true); // 顯示彈出視窗
  };

  return (
    <div className="bg-darkBlue md:w-4/5 h-fit mt-36">
      <h2 className="text-2xl font-bold text-cream mb-6 ml-12 md:ml-80">
        圓夢進度
      </h2>
      {inProgressDreams.length > 0 ? (
        <div className="space-y-6 flex flex-col justify-center items-center md:items-start">
          {inProgressDreams.map((dream) => {
            const { daysRemaining, progress } = calculateProgress(
              dream.startDate,
              dream.endDate
            );
            return (
              <div
                key={dream.id}
                className="p-6 rounded-lg flex flex-col md:flex-row items-center md:ml-64 w-11/12 gap-6 md:gap-0"
              >
                {/* 願望卡片 */}
                <div className="flex-shrink-0">
                  <WishCardWithId wishId={dream.wishId} />
                </div>
                {/* 進度條和截止日期 */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 mx-auto bg-white h-[200px] rounded-xl">
                  <p className="text-darkBlue mb-4">
                    截止日期:{" "}
                    {moment(dream.endDate.toDate()).format("YYYY-MM-DD")}
                  </p>

                  <div className="w-3/4 bg-gray-300 h-4 rounded-full relative">
                    <div
                      className="bg-yellow h-full rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <p className="text-darkBlue mt-2">
                    已經過 {progress.toFixed(2)}% , 剩餘{" "}
                    {Math.ceil(daysRemaining)} 天
                  </p>
                </div>
                <div
                  className="flex
                flex-col"
                >
                  <button
                    className="bg-lightBlue text-white py-2 px-4 rounded mt-4"
                    onClick={() => navigate(`/memberpage/chat/${dream.chatId}`)} // 導航到聊天室頁面
                  >
                    聯絡許願卡主人
                  </button>
                  <button
                    className="bg-lightBlue text-white py-2 px-4 rounded mt-4"
                    onClick={() => handleUploadProof(dream)}
                  >
                    上傳圓夢證明
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-white ml-12 md:ml-80">目前沒有正在進行的圓夢。</p>
      )}
      {showUploadModal && selectedDream && (
        <ProofUploadModal
          onClose={() => setShowUploadModal(false)}
          dreamId={selectedDream.id}
          wishId={selectedDream.wishId}
          wishOwnerId={selectedDream.wishOwnerId}
        />
      )}
    </div>
  );
};

export default Progress;
