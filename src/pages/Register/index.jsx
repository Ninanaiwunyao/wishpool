import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase/firebaseConfig";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    const auth = getAuth();
    const storage = getStorage();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      let avatarUrl = "";
      if (data.avatar[0]) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, data.avatar[0]);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        userName: data.userName,
        avatarUrl: avatarUrl,
        coins: 0,
        level: 1,
        achievements: [],
        completedWishes: 0,
        supportedDreams: 0,
        reputation: 0,
      });

      navigate("/");
    } catch (err) {
      console.error("註冊失敗:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-darkBlue flex items-center justify-center">
      <div className="bg-lightBlue p-8 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">註冊新帳號</h2>
        <form onSubmit={handleSubmit(handleRegister)}>
          <div className="mb-4">
            <label className="block mb-2">名稱</label>
            <input
              type="text"
              placeholder="請輸入用戶名稱"
              {...register("userName", { required: "用戶名為必填項" })}
              className="w-full p-2 rounded border border-gray-300"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm">{errors.userName.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2">入池許可證</label>
            <input
              type="email"
              placeholder="請輸入電子郵件"
              {...register("email", { required: "電子郵件為必填項" })}
              className="w-full p-2 rounded border border-gray-300"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2">密碼</label>
            <input
              type="password"
              placeholder="請輸入密碼"
              {...register("password", { required: "密碼為必填項" })}
              className="w-full p-2 rounded border border-gray-300"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2">上傳頭像</label>
            <input
              type="file"
              {...register("avatar")}
              className="w-full p-2 rounded border border-gray-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-2 rounded-full font-bold hover:bg-yellow-500"
          >
            註冊
          </button>
        </form>
        <p className="text-center mt-4">
          已有帳號？{" "}
          <a href="/login" className="text-darkBlue font-bold">
            立即登入
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
