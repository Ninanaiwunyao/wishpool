import { useState, useEffect } from "react";
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

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // 控制編輯模式
  const [newAvatarFile, setNewAvatarFile] = useState(null); // 控制新的頭像文件
  const [userWishes, setUserWishes] = useState([]); // 用於儲存當前用戶的願望卡
  const { register, handleSubmit, reset } = useForm();
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  const user = auth.currentUser;

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
        setUserData(userDoc.data());
        reset(userDoc.data()); // 初始化表單的數據
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user, db, reset]);

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setNewAvatarFile(e.target.files[0]); // 保存新上傳的頭像文件
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

        // 刪除舊頭像
        if (userData.avatarUrl) {
          await deleteObject(oldAvatarRef);
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
      setIsEditing(false); // 退出編輯模式
      setNewAvatarFile(null); // 清除文件選擇
      alert("資料更新成功！");
    } catch (error) {
      console.error("更新失敗：", error);
      alert("資料更新失敗！");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-darkBlue min-h-screen p-8 flex flex-col items-center">
      {/* 頂部導航 */}
      <div className="flex w-4/5 justify-between items-center mb-6 mt-32">
        <h2 className="text-2xl text-cream flex items-center">個人檔案</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-lightBlue text-white py-2 px-4 rounded-full hover:bg-blue-400 "
        >
          {isEditing ? "取消編輯" : "編輯個人資料"}
        </button>
      </div>

      {/* 中間內容區域 */}
      <div className="bg-white p-8 rounded-xl shadow-lg flex w-4/5 space-x-8">
        {/* 檔案區 */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-start space-y-4 w "
        >
          <img
            src={userData.avatarUrl}
            alt="頭像"
            className="w-32 h-32 rounded-full object-cover mb-4 border-4"
          />
          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-2 text-sm"
            />
          )}
          {isEditing ? (
            <input
              {...register("userName")}
              defaultValue={userData.userName}
              className="border-solid border-2 border-darkBlue rounded mt-2"
            />
          ) : (
            <p className="text-lg mt-2">{userData.userName}</p>
          )}

          {isEditing && (
            <button
              type="submit"
              className="bg-lightBlue text-white py-2 px-4 rounded-full hover:bg-blue-400 mt-4"
            >
              保存
            </button>
          )}
        </form>

        {/* 數據區 */}
        <div className="flex flex-col items-start px-4 m-0">
          <div>
            <h3 className="font-bold text-darkBlue">硬幣數量</h3>
            <p className="text-darkBlue">{userData.coins} Coins</p>
            <h3 className="font-bold text-darkBlue">信譽分數</h3>
            <p className="text-darkBlue">{userData.reputation} Reputation</p>
          </div>
        </div>

        {/* 等級區 */}
        <div className="flex flex-col items-start">
          <div className="bg-lightBlue p-6 rounded-xl shadow-lg flex flex-col justify-center w-96">
            <h3 className="font-bold text-darkBlue">Level {userData.level}</h3>
            <p className="text-darkBlue">
              {6000 - userData.coins - userData.reputation} points to next level
            </p>
            <div className="w-full border-2 border-yellow-500 rounded-full h-4 mt-4 relative">
              <div
                className="bg-yellow h-full rounded-full"
                style={{
                  width: `${Math.min(
                    ((userData.coins + userData.reputation) / 6000) * 100,
                    100
                  )}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
            <p className="text-darkBlue mt-2">
              {Math.min(
                ((userData.coins + userData.reputation) / 6000) * 100,
                100
              ).toFixed(2)}
              % Completed
            </p>
          </div>
        </div>
      </div>

      {/* 許願記錄 */}
      <div className="w-4/5 mt-8 flex flex-col items-start">
        <h3 className="text-cream text-2xl mb-4">許願記錄</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userWishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
