import CustomAlert from "@/components/CustomAlert";
import WishCard from "@/components/WishCard";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import AvatarEditor from "react-avatar-edit";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import angelMoon from "./angel-moon.png";
import coinsIcon from "./coinsIcon.png";
import BGLeft from "./galleryBGLeft.png";
import BGRight from "./galleryBGRight.png";
import memberIcon from "./noIcon.jpg";
import reputationIcon from "./reputationIcon.png";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [userWishes, setUserWishes] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  const user = auth.currentUser;
  const resetForm = useCallback(
    (data) => {
      reset(data);
    },
    [reset]
  );
  const handleInviteClick = () => {
    const inviteMessage = `https://appworks-school-wishpool.web.app/register?inviteCode=${user.uid} 邀請您加入許願池！使用我的邀請碼立即獲得100枚硬幣`;
    navigator.clipboard
      .writeText(inviteMessage)
      .then(() => {
        setAlertMessage("邀請碼已複製到剪貼板，您可以分享給朋友！");
      })
      .catch(() => {
        setAlertMessage("無法複製邀請碼，請手動複製。");
      });
  };
  useEffect(() => {
    const fetchUserWishes = async () => {
      if (!user) return;

      const wishesRef = collection(db, "wishes");
      const q = query(wishesRef, where("creatorId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const fetchedWishes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      fetchedWishes.sort((a, b) => b.createdAt - a.createdAt);

      setUserWishes(fetchedWishes);
    };

    fetchUserWishes();
  }, [user, db]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { coins, reputation } = userData;

        const calculatedLevel = Math.floor(coins / 100 + reputation / 50);

        if (userData.level !== calculatedLevel) {
          await updateDoc(userRef, {
            level: calculatedLevel,
          });
        }

        setUserData({ ...userData, level: calculatedLevel });
        resetForm({ ...userData, level: calculatedLevel });
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user, db, resetForm]);

  const handleAvatarSave = async () => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    let newAvatarUrl = userData.avatarUrl;

    try {
      if (newAvatarPreview) {
        const oldAvatarRef = ref(storage, `avatars/${user.uid}`);
        const newAvatarRef = ref(storage, `avatars/${user.uid}`);

        if (userData.avatarUrl) {
          try {
            await deleteObject(oldAvatarRef);
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              console.warn("舊頭像文件不存在，無需刪除。");
            } else {
              throw error;
            }
          }
        }

        const response = await fetch(newAvatarPreview);
        const blob = await response.blob();

        await uploadBytes(newAvatarRef, blob);
        newAvatarUrl = await getDownloadURL(newAvatarRef);
      }

      await updateDoc(userRef, {
        avatarUrl: newAvatarUrl,
      });

      setUserData({
        ...userData,
        avatarUrl: newAvatarUrl,
      });

      setNewAvatarPreview(null);
      setIsEditingAvatar(false);
      setAlertMessage("資料更新成功！");
    } catch (error) {
      console.error("更新失敗：", error);
      setAlertMessage("資料更新失敗！");
    }
  };
  const cancelEditAvatar = () => {
    setIsEditingAvatar(false);
    setNewAvatarPreview(null);
  };
  const cancelEditName = () => {
    setIsEditingName(false);
  };

  const onSubmit = async (data) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    let newAvatarUrl = userData.avatarUrl;

    try {
      if (newAvatarFile) {
        const oldAvatarRef = ref(storage, `avatars/${user.uid}`);
        const newAvatarRef = ref(storage, `avatars/${user.uid}`);

        if (userData.avatarUrl) {
          try {
            await deleteObject(oldAvatarRef);
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              console.warn("舊頭像文件不存在，無需刪除。");
            } else {
              throw error;
            }
          }
        }

        await uploadBytes(newAvatarRef, newAvatarFile);
        newAvatarUrl = await getDownloadURL(newAvatarRef);
      }

      await updateDoc(userRef, {
        userName: data.userName,
        avatarUrl: newAvatarUrl,
      });

      setUserData({
        ...userData,
        userName: data.userName,
        avatarUrl: newAvatarUrl,
      });
      setIsEditingName(false);
      setNewAvatarFile(null);
      setAlertMessage("資料更新成功！");
    } catch (error) {
      console.error("更新失敗：", error);
      setAlertMessage("資料更新失敗！");
    }
  };

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

          <p className="text-white text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const coinsForLevelUp = 100;
  const reputationForLevelUp = 50;

  const totalPointsForLevelUp = coinsForLevelUp + reputationForLevelUp;

  const currentLevelPoints =
    (userData.coins % coinsForLevelUp) +
    (userData.reputation % reputationForLevelUp);

  const nextLevelPoints = totalPointsForLevelUp;

  const progressPercentage = Math.min(
    (currentLevelPoints / nextLevelPoints) * 100,
    100
  );

  return (
    <div className="flex flex-col h-fit items-center min-h-screen relative">
      <img
        src={angelMoon}
        alt=""
        className="hidden md:block absolute right-36 h-72 top-16 z-30"
      />
      <div className="flex-col flex w-4/5 items-center justify-start md:items-start mb-6 mt-24 md:mt-36 md:ml-80 md:mr-24 z-20">
        <div className="">
          <h2 className="text-2xl text-white font-bold mb-6">個人檔案</h2>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col w-full md:w-10/12 items-center justify-between md:flex-row ">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col space-y-4 w-1/8 items-center"
          >
            <div className="relative group">
              <img
                src={userData.avatarUrl ? userData.avatarUrl : memberIcon}
                alt="頭像"
                className="w-32 h-32 rounded-full object-cover mb-4 border-4"
              />
              {isEditingAvatar ? (
                <div className="w-32 h-32 rounded-full absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <AvatarEditor
                    width={150}
                    height={150}
                    label="編輯"
                    onCrop={(preview) => setNewAvatarPreview(preview)}
                    onClose={() => setNewAvatarPreview(null)}
                    imageWidth={150}
                    imageHeight={150}
                  />
                </div>
              ) : (
                <div
                  className="absolute inset-0 bg-black bg-opacity-30 w-32 h-32 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingAvatar(true)}
                >
                  <p className="text-white">編輯</p>
                </div>
              )}
            </div>
            {isEditingAvatar && (
              <div className="flex space-x-4">
                {newAvatarPreview && (
                  <button
                    type="button"
                    className="ml-2 bg-lightBlue text-white py-1 px-3 rounded-full hover:bg-blue-400"
                    onClick={handleAvatarSave}
                  >
                    儲存圖片
                  </button>
                )}
                <button
                  type="button"
                  className=" bg-red-400 text-white py-1 px-3 rounded-full hover:bg-red-500"
                  onClick={cancelEditAvatar}
                >
                  取消
                </button>
              </div>
            )}
            {isEditingName ? (
              <div className="flex flex-col items-center justify-center mt-0">
                <input
                  {...register("userName", {
                    required: "名稱不能為空",
                    maxLength: {
                      value: 10,
                      message: "名稱不能超過10個字",
                    },
                  })}
                  defaultValue={userData.userName}
                  className="border-solid border-2 border-darkBlue rounded w-36"
                />
                {errors.userName && (
                  <p className="text-red-500">{errors.userName.message}</p>
                )}
                <div className="flex space-x-4 mt-4">
                  <button
                    type="submit"
                    className=" bg-lightBlue text-white py-1 px-3 rounded-full hover:bg-blue-400"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="bg-red-400 text-white py-1 px-3 rounded-full hover:bg-red-500"
                    onClick={cancelEditName}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <p className="text-lg">{userData.userName}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 ml-2 text-darkBlue cursor-pointer hover:text-lightBlue"
                  onClick={() => setIsEditingName(true)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </div>
            )}
            <button
              type="button"
              className="bg-lightBlue text-white py-2 px-4 rounded-full hover:bg-blue-400 mt-4"
              onClick={handleInviteClick}
            >
              複製邀請碼
            </button>
          </form>

          <div className="ml-0 flex flex-col items-start space-y-8 md:w-1/3 w-4/5 justify-center mt-8 md:mt-0">
            <div className="bg-lightBlue p-4 md:p-6 rounded-xl shadow-md w-full flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-cream md:text-2xl text-sm">
                  硬幣數量
                </h3>
                <div className="flex items-center md:text-2xl text-sm">
                  <img
                    src={coinsIcon}
                    alt="Coins Icon"
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-white font-bold md:text-2xl text-sm">
                    {userData.coins} 枚
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-lightBlue p-4 md:p-6 rounded-xl shadow-md w-full flex flex-col justify-center">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-cream md:text-2xl text-sm">
                  信譽分數
                </h3>
                <div className="flex items-center md:text-2xl text-sm">
                  <img
                    src={reputationIcon}
                    alt="Reputation Icon"
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-white font-bold md:text-2xl text-sm">
                    {userData.reputation} 分
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-4/5 md:w-2/5 flex flex-col items-start justify-center mt-8 md:m-0">
            <div className="bg-lightBlue p-6 rounded-xl shadow-lg flex flex-col justify-center w-full">
              <h3 className="font-bold text-darkBlue">
                Level {userData.level}
              </h3>
              <p className="text-darkBlue">
                離升級還差 {nextLevelPoints - currentLevelPoints} 分
              </p>
              <div className="w-full border-2 border-yellow-500 rounded-full h-4 mt-4 relative">
                <div
                  className="bg-yellow h-full rounded-full"
                  style={{
                    width: `${progressPercentage}%`,
                    transition: "width 0.5s ease-in-out",
                  }}
                ></div>
              </div>
              <p className="text-darkBlue mt-2">
                {progressPercentage.toFixed(2)}% 完成
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-4/5 mt-8 mb-16 md:ml-64 md:mr-8 flex flex-col items-center md:items-start z-20">
        <h3 className="text-white text-2xl mb-6 font-bold">許願記錄</h3>
        {userWishes.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-12 w-[88%] justify-items-center md:justify-items-start">
            {userWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} className=" mb-16" />
            ))}
          </div>
        ) : (
          <Link
            to="/wishForm"
            className="w-64 h-16 p-4 flex justify-center items-center bg-yellow text-lightBlue font-semibold text-xl rounded-full hover:bg-darkYellow"
          >
            立即許下第一個心願
          </Link>
        )}
      </div>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <img src={BGLeft} alt="" className="absolute bottom-0 left-0 w-96" />
      <img src={BGRight} alt="" className="absolute bottom-0 right-0 w-96" />
    </div>
  );
};

export default Profile;
