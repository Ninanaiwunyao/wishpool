import { useCallback, useState, useEffect } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { useForm } from "react-hook-form";
import WishCard from "@/components/WishCard";
import coinsIcon from "./coinsIcon.png";
import reputationIcon from "./reputationIcon.png";
import memberIcon from "./noIcon.jpg";
import CustomAlert from "@/components/CustomAlert";
import AvatarEditor from "react-avatar-edit";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false); // 控制名字編輯模式
  const [newAvatarFile, setNewAvatarFile] = useState(null); // 控制新的頭像文件
  const [userWishes, setUserWishes] = useState([]); // 用於儲存當前用戶的願望卡
  const [alertMessage, setAlertMessage] = useState(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState(null); // 保存裁剪後的頭像預覽
  const { register, handleSubmit, reset } = useForm();
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
    const inviteMessage = `https://appworks-school-wishpool.web.app/ 邀請您加入許願池！使用我的邀請碼${user.uid}立即獲得100枚硬幣！`;
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

      // 按照 createdAt 排序
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

        // 計算新的等級
        const calculatedLevel = Math.floor(coins / 100 + reputation / 50);

        // 如果等級有變化，更新資料庫
        if (userData.level !== calculatedLevel) {
          await updateDoc(userRef, {
            level: calculatedLevel,
          });
        }

        // 更新狀態並重置表單
        setUserData({ ...userData, level: calculatedLevel });
        resetForm({ ...userData, level: calculatedLevel }); // 使用封裝的 reset 函數
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
      setAlertMessage("資料更新成功！");
    } catch (error) {
      console.error("更新失敗：", error);
      setAlertMessage("資料更新失敗！");
    }
  };

  const onSubmit = async (data) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    let newAvatarUrl = userData.avatarUrl; // 頭像URL初始化為舊的URL

    try {
      if (newAvatarFile) {
        // 如果有新頭像文件，先上傳新的頭像
        const oldAvatarRef = ref(storage, `avatars/${user.uid}`);
        const newAvatarRef = ref(storage, `avatars/${user.uid}`);

        // 刪除舊頭像，如果存在
        if (userData.avatarUrl) {
          try {
            await deleteObject(oldAvatarRef);
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              console.warn("舊頭像文件不存在，無需刪除。");
            } else {
              throw error; // 其他錯誤繼續拋出
            }
          }
        }

        // 上傳新頭像
        await uploadBytes(newAvatarRef, newAvatarFile);
        newAvatarUrl = await getDownloadURL(newAvatarRef);
      }

      // 更新 Firestore 中的用戶數據
      await updateDoc(userRef, {
        userName: data.userName,
        avatarUrl: newAvatarUrl,
      });

      setUserData({
        ...userData,
        userName: data.userName,
        avatarUrl: newAvatarUrl,
      });
      setIsEditingName(false); // 退出編輯模式
      setNewAvatarFile(null); // 清除文件選擇
      setAlertMessage("資料更新成功！");
    } catch (error) {
      console.error("更新失敗：", error);
      setAlertMessage("資料更新失敗！");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // 每個等級的硬幣和信譽點數需求
  const coinsForLevelUp = 100;
  const reputationForLevelUp = 50;

  const totalPointsForLevelUp = coinsForLevelUp + reputationForLevelUp;

  // 計算當前等級累積的硬幣和信譽分數
  const currentLevelPoints =
    (userData.coins % coinsForLevelUp) +
    (userData.reputation % reputationForLevelUp);

  // 下一等級需要的分數
  const nextLevelPoints = totalPointsForLevelUp;

  // 計算進度條百分比
  const progressPercentage = Math.min(
    (currentLevelPoints / nextLevelPoints) * 100,
    100
  );

  return (
    <div className="bg-darkBlue flex flex-col h-fit items-center md:ml-48 md:mr-24 min-h-screen">
      <div className="flex w-4/5 justify-between items-center mb-6 mt-36">
        <h2 className="text-2xl text-cream font-bold">個人檔案</h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col w-4/5 items-center md:justify-between md:flex-row">
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
            <div className="w-32 h-32 rounded-full absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
          </div>
          {newAvatarPreview && (
            <button
              type="button"
              className="ml-2 bg-lightBlue text-white py-1 px-3 rounded-full hover:bg-blue-400"
              onClick={handleAvatarSave}
            >
              儲存圖片
            </button>
          )}
          {isEditingName ? (
            <div className="flex items-center">
              <input
                {...register("userName")}
                defaultValue={userData.userName}
                className="border-solid border-2 border-darkBlue rounded mt-2"
              />
              <button
                type="submit"
                className="ml-2 bg-lightBlue text-white py-1 px-3 rounded-full hover:bg-blue-400"
              >
                保存
              </button>
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
              <h3 className="font-bold text-darkBlue md:text-2xl text-sm">
                硬幣數量
              </h3>
              <div className="flex items-center md:text-2xl text-sm">
                <img
                  src={coinsIcon}
                  alt="Coins Icon"
                  className="w-6 h-6 mr-2"
                />
                <span className="text-cream font-bold md:text-2xl text-sm">
                  {userData.coins} 枚
                </span>
              </div>
            </div>
          </div>
          <div className="bg-lightBlue p-4 md:p-6 rounded-xl shadow-md w-full flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-darkBlue md:text-2xl text-sm">
                信譽分數
              </h3>
              <div className="flex items-center md:text-2xl text-sm">
                <img
                  src={reputationIcon}
                  alt="Reputation Icon"
                  className="w-6 h-6 mr-2"
                />
                <span className="text-cream font-bold md:text-2xl text-sm">
                  {userData.reputation} 分
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-4/5 md:w-2/5 flex flex-col items-start justify-center mt-8 md:m-0">
          <div className="bg-lightBlue p-6 rounded-xl shadow-lg flex flex-col justify-center w-full">
            <h3 className="font-bold text-darkBlue">Level {userData.level}</h3>
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

      <div className="w-4/5 mt-8 mb-16">
        <h3 className="text-cream text-2xl mb-6 font-bold">許願記錄</h3>
        <div className="flex flex-row flex-wrap md:justify-between justify-center gap-12">
          {userWishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} className=" mb-16" />
          ))}
        </div>
      </div>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default Profile;
