import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProofUploadModal from "@/components/ProofUploadModal";
import ProofDisplayModal from "@/components/ProofDisplayModal";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import WishCardWithId from "@/components/WishCardWithId";
import moment from "moment";
import tapepng from "./tape.png";
import { motion } from "framer-motion";
import angelFly from "./angel-fly.png";
import CustomAlert from "@/components/CustomAlert";

const Progress = () => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [inProgressDreams, setInProgressDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
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

  const calculateProgress = (startDate, endDate) => {
    const now = moment();
    const start = moment(startDate.toDate());
    const end = moment(endDate.toDate());
    const totalDays = moment.duration(end.diff(start)).asDays();
    const daysRemaining = moment.duration(end.diff(now)).asDays();
    const progress = Math.max(
      0,
      Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)
    );

    return { daysRemaining, progress };
  };

  const handleUploadProof = (dream) => {
    setSelectedDream(dream);
    setShowUploadModal(true);
  };

  const handleViewProof = (dream) => {
    setSelectedDream(dream);
    setShowProofModal(true);
  };

  const handleProofUploadSuccess = async (proofData) => {
    setAlertMessage("證明上傳成功，已通知許願者！");
    const dreamDocRef = doc(db, "dreams", selectedDream.id);
    await updateDoc(dreamDocRef, {
      proof: proofData,
      approved: "pending",
    });

    setInProgressDreams((prevDreams) =>
      prevDreams.map((d) =>
        d.id === selectedDream.id
          ? { ...d, proof: proofData, approved: "pending" }
          : d
      )
    );
    setShowUploadModal(false);
  };

  return (
    <div className="flex-col flex items-center md:items-start md:justify-start md:w-4/5 h-fit min-h-screen mt-36 relative">
      <h2 className="text-2xl font-bold text-white mb-6 md:ml-72">圓夢進度</h2>

      {inProgressDreams.length > 0 ? (
        <div className="flex justify-center md:justify-start flex-wrap gap-6 w-11/12 md:ml-72">
          {inProgressDreams.map((dream) => {
            const { daysRemaining, progress } = calculateProgress(
              dream.startDate,
              dream.endDate
            );

            return (
              <div
                key={dream.id}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between h-auto relative"
              >
                <img
                  src={tapepng}
                  alt=""
                  className="absolute z-10 w-32 top-[-55px] left-20"
                />
                <div className="mb-6 flex justify-center">
                  <WishCardWithId wishId={dream.wishId} />
                </div>

                <div className="bg-lightGray p-4 rounded-md">
                  <p className="text-darkBlue font-medium mb-4 text-center">
                    截止日期:{" "}
                    {moment(dream.endDate.toDate()).format("YYYY-MM-DD")}
                  </p>

                  <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-yellow h-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <p className="text-darkBlue text-center">
                    已經過 {progress.toFixed(2)}%，剩餘{" "}
                    {Math.ceil(daysRemaining)} 天
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-4 items-center">
                  <button
                    className="bg-lightBlue text-white py-2 px-6 rounded-3xl w-full"
                    onClick={() => navigate(`/memberpage/chat/${dream.chatId}`)}
                  >
                    聯絡許願卡主人
                  </button>
                  {dream.proof && dream.approved === "pending" && (
                    <button
                      className="bg-lightBlue text-white py-2 px-6 rounded-3xl w-full"
                      onClick={() => handleViewProof(dream)}
                    >
                      查看圓夢證明
                    </button>
                  )}

                  {(!dream.proof || dream.approved === "false") && (
                    <button
                      className="bg-lightBlue text-white py-2 px-6 rounded-3xl w-full"
                      onClick={() => handleUploadProof(dream)}
                    >
                      上傳圓夢證明
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-white text-center mt-2 md:ml-72">
          目前沒有正在進行的圓夢。
        </p>
      )}

      {showUploadModal && selectedDream && (
        <ProofUploadModal
          onClose={() => setShowUploadModal(false)}
          dreamId={selectedDream.id}
          wishId={selectedDream.wishId}
          wishOwnerId={selectedDream.wishOwnerId}
          onUploadSuccess={handleProofUploadSuccess}
        />
      )}

      {showProofModal && selectedDream && (
        <ProofDisplayModal
          proof={selectedDream.proof}
          onClose={() => setShowProofModal(false)}
        />
      )}
      <motion.div
        animate={{ y: ["0%", "-10%", "0%"] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="hidden md:block absolute bottom-36 right-[-300px]"
      >
        <img src={angelFly} alt="" className="h-full" />
      </motion.div>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};
export default Progress;
