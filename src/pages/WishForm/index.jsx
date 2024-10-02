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

const WishForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("用戶未登錄");
      return;
    }

    // 獲取用戶的硬幣數量
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error("找不到用戶");
      return;
    }

    const currentCoins = userDoc.data().coins;
    const amount = parseInt(data.amount);

    if (currentCoins < amount) {
      alert("你的硬幣不足以許願");
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

      // 扣除硬幣
      await updateDoc(userRef, {
        coins: increment(-amount),
      });

      // 新增願望至 wishes 集合
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

      // 新增交易紀錄至 transactions 集合
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: -amount, // 扣除的硬幣
        type: "make-wish", // 許願交易類型
        timestamp: serverTimestamp(),
        relatedId: wishDocRef.id, // 記錄相關的願望 ID
      });

      alert("願望已成功提交！");
      navigate("/wishPool");
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
            請決定要投入多少硬幣
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
            {...register("title", { required: true })}
          />
          {errors.title && <p className="text-red-500">此欄位為必填項。</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            詳細說說你的願望
          </label>
          <textarea
            placeholder="輸入願望內容"
            className="w-full p-2 border rounded"
            {...register("description", { required: true })}
          />
          {errors.description && (
            <p className="text-red-500">此欄位為必填項。</p>
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
            {...register("image", { required: true })}
          />
          {errors.image && <p className="text-red-500">此欄位為必填項。</p>}
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
    </div>
  );
};

export default WishForm;
