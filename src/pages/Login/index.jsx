import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate("/");
    } catch (err) {
      console.error("登入失敗:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-darkBlue flex items-center justify-center">
      <div className="bg-lightBlue p-8 rounded-lg shadow-md w-80">
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
          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-2 rounded-full font-bold hover:bg-yellow-500"
          >
            入池
          </button>
        </form>
        <p className="text-center mt-4">
          還沒有許可證？{" "}
          <a href="/register" className="text-darkBlue font-bold">
            立即申請
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
