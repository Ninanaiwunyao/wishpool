import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  addDoc,
  serverTimestamp,
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebaseConfig";
import backgroundImage from "./starBackground.png";
import angelSit from "./angel-sit.png";
import angelStand from "./angel-stand.png";
import CustomAlert from "@/components/CustomAlert";

const WishForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const onSubmit = async (data) => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("用戶未登錄");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("找不到用戶");
      return;
    }

    const currentCoins = userDoc.data().coins;
    const amount = parseInt(data.amount);

    if (currentCoins < amount) {
      setAlertMessage("你的硬幣不足以許願");
      return;
    }

    const tags = [data.tag1, data.tag2, data.tag3].filter((tag) => tag);
    try {
      let imageUrl = "";
      if (data.image[0]) {
        const imageFile = data.image[0];
        const storageRef = ref(storage, `wish_images/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(userRef, {
        coins: increment(-amount),
      });

      const wishDocRef = await addDoc(collection(db, "wishes"), {
        amount,
        createdAt: serverTimestamp(),
        creatorId: user.uid,
        description: data.description,
        dreamerId: "",
        imageUrl,
        likeCount: 0,
        status: "open",
        tags,
        title: data.title,
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: -amount,
        type: "make-wish",
        timestamp: serverTimestamp(),
        relatedId: wishDocRef.id,
      });

      setAlertMessage("願望已成功提交！");
      setTimeout(() => {
        navigate("/wishPool");
      }, 2000);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div
      className="bg-darkBlue min-h-screen flex flex-col items-center p-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center -90px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        className="bg-white rounded-xl shadow-lg p-8 md:w-3/5 w-full h-screen-2xl mt-16 md:mt-24 mb-8 relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-center text-2xl font-bold mb-6">願望單</h2>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            請決定要投入多少硬幣（請以5個為單位）
          </label>
          <input
            type="number"
            placeholder="輸入投入硬幣數"
            className="w-full p-2 border rounded"
            min="5"
            step="5"
            {...register("amount", {
              required: "此欄位為必填項。",
              validate: {
                isMultipleOfFive: (value) =>
                  value % 5 === 0 || "必須是 5 的倍數。",
              },
            })}
          />
          {errors.amount && (
            <p className="text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            幫你的願望取個名字吧！
          </label>
          <input
            type="text"
            placeholder="輸入願望主旨"
            className="w-full p-2 border rounded"
            {...register("title", {
              required: "此欄位為必填項",
              maxLength: {
                value: 10,
                message: "不能超過10個字",
              },
              validate: {
                notOnlyWhitespace: (value) =>
                  value.trim() !== "" || "名稱不能只包含空白字符",
              },
            })}
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            詳細說說你的願望
          </label>
          <textarea
            placeholder="輸入願望內容"
            className="w-full p-2 border rounded"
            {...register("description", {
              required: "此欄位為必填項。",
              validate: {
                notOnlyWhitespace: (value) =>
                  value.trim() !== "" || "內容不能只包含空白字符",
              },
            })}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">幫你的願望歸類</label>
          <select
            className="w-full p-2 border rounded mb-2"
            {...register("tag1")}
          >
            <option value="">選擇標籤1</option>
            <option value="愛情">愛情</option>
            <option value="學業">學業</option>
            <option value="生活">生活</option>
            <option value="工作">工作</option>
            <option value="興趣">興趣</option>
            <option value="家庭">家庭</option>
            <option value="公益">公益</option>
            <option value="人際">人際</option>
          </select>

          <select
            className="w-full p-2 border rounded mb-2"
            {...register("tag2")}
          >
            <option value="">選擇標籤2</option>
            <option value="愛情">愛情</option>
            <option value="學業">學業</option>
            <option value="生活">生活</option>
            <option value="工作">工作</option>
            <option value="興趣">興趣</option>
            <option value="家庭">家庭</option>
            <option value="公益">公益</option>
            <option value="人際">人際</option>
          </select>

          <select className="w-full p-2 border rounded" {...register("tag3")}>
            <option value="">選擇標籤3</option>
            <option value="愛情">愛情</option>
            <option value="學業">學業</option>
            <option value="生活">生活</option>
            <option value="工作">工作</option>
            <option value="興趣">興趣</option>
            <option value="家庭">家庭</option>
            <option value="公益">公益</option>
            <option value="人際">人際</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            上傳一張關於願望的圖片
          </label>
          <input
            type="file"
            className="w-full p-2 border rounded"
            accept="image/*"
            {...register("image", {
              required: "此欄位為必填項。",
              validate: {
                isImage: (files) => {
                  if (!files || files.length === 0) {
                    return "請選擇一張圖片";
                  }
                  const file = files[0];
                  const validImageTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                  ];
                  return (
                    validImageTypes.includes(file.type) ||
                    "只允許上傳 JPEG、PNG 或 GIF 格式的圖片"
                  );
                },
              },
            })}
          />
          {errors.image && (
            <p className="text-red-500">{errors.image.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-black text-white font-bold rounded px-6 py-2 w-full mt-4"
        >
          投入許願池
        </button>
        <img
          src={angelSit}
          alt="angel sitting"
          className="hidden md:block absolute bottom-0 right-[-80px] h-48"
        />
        <img
          src={angelStand}
          alt="angel standing"
          className="hidden md:block absolute bottom-[-50px] left-[-100px] h-48"
        />
      </form>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default WishForm;
