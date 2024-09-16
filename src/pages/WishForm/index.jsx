import { useForm } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/firebaseConfig";
const WishForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("用戶未登錄");
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
      await addDoc(collection(db, "wishes"), {
        amount: parseInt(data.amount),
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

      alert("願望已成功提交！");
      navigate("/wishPool");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="bg-darkblue min-h-screen flex flex-col items-center p-8 mt-24">
      <form
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-center text-2xl font-bold mb-6">願望單</h2>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">輸入投入金額</label>
          <input
            type="number"
            placeholder="輸入投入金額"
            className="w-full p-2 border rounded"
            {...register("amount", { required: true })}
          />
          {errors.amount && <p className="text-red-500">此欄位為必填項。</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">輸入願望主旨</label>
          <input
            type="text"
            placeholder="輸入願望主旨"
            className="w-full p-2 border rounded"
            {...register("title", { required: true })}
          />
          {errors.title && <p className="text-red-500">此欄位為必填項。</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">輸入願望內容</label>
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
          <label className="block text-sm font-bold mb-2">選擇願望標籤</label>
          <select
            className="w-full p-2 border rounded mb-2"
            {...register("tag1")}
          >
            <option value="">選擇標籤1</option>
            <option value="愛情">愛情</option>
            <option value="學業">學業</option>
            <option value="生活">生活</option>
            <option value="工作">工作</option>
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
          </select>

          <select className="w-full p-2 border rounded" {...register("tag3")}>
            <option value="">選擇標籤3</option>
            <option value="愛情">愛情</option>
            <option value="學業">學業</option>
            <option value="生活">生活</option>
            <option value="工作">工作</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">上傳圖片</label>
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
      </form>
    </div>
  );
};

export default WishForm;
