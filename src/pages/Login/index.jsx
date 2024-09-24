import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect } from "react";
import backgroundImage from "./logInBg.png";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("isAuthenticated", "true");
        navigate("/");
      } else {
        localStorage.removeItem("isAuthenticated");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogin = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // 在這裡不需要導航，因為 `onAuthStateChanged` 會自動處理
    } catch (err) {
      console.error("登入失敗:", err.message);
      alert("登入失敗，請檢查您的電子郵件和密碼");
    }
  };

  return (
    <div
      className="min-h-screen bg-darkBlue flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center -90px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-lightBlue p-8 shadow-md rounded-2xl w-[500px]">
        <h2 className="text-2xl font-bold mb-6 text-center">歡迎回到許願池</h2>
        <form onSubmit={handleSubmit(handleLogin)}>
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
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="w-1/2 bg-yellow text-lightBlue py-2 rounded-full font-bold hover:bg-darkYellow "
            >
              入池
            </button>
          </div>
        </form>
        <p className="text-center mt-4">
          還沒有許可證？{" "}
          <Link to="/register" className="text-darkBlue font-bold">
            立即申請
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
