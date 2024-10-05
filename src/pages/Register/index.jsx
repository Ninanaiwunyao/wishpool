import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/firebase/firebaseConfig";
import backgroundImage from "./logInBg.png";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [invitationCode, setInvitationCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("inviteCode");
    if (code) {
      setInvitationCode(code);
    }
  }, []);

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

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        userName: data.userName,
        avatarUrl: avatarUrl,
        coins: 30,
        level: 1,
        achievements: [],
        completedWishes: 0,
        supportedDreams: 0,
        reputation: 0,
      });
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: 30,
        type: "registration-bonus",
        timestamp: serverTimestamp(),
      });
      if (invitationCode) {
        const inviterRef = doc(db, "users", invitationCode);
        const inviterDoc = await getDoc(inviterRef);

        if (inviterDoc.exists()) {
          // 更新邀請者和新註冊者的金幣數量
          await updateDoc(inviterRef, {
            coins: increment(100), // 邀請者增加 100 金幣
          });

          await updateDoc(userRef, {
            coins: increment(100), // 新註冊者也增加 100 金幣
          });

          // 記錄邀請者的交易
          await addDoc(collection(db, "transactions"), {
            userId: invitationCode,
            amount: 100,
            type: "invitation-bonus", // 交易類型為邀請獎勵
            timestamp: serverTimestamp(),
            invitedUserId: user.uid, // 記錄被邀請者的 UID
          });

          // 記錄新註冊者的交易
          await addDoc(collection(db, "transactions"), {
            userId: user.uid,
            amount: 100,
            type: "invitation-bonus", // 交易類型為註冊獎勵
            timestamp: serverTimestamp(),
            inviterId: invitationCode, // 記錄邀請者的 UID
          });

          console.log("註冊成功，邀請者和新註冊者各獲得 100 金幣，並記錄交易");
        } else {
          console.log("無效的邀請碼");
        }
      }

      navigate("/");
    } catch (err) {
      console.error("註冊失敗:", err.message);
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
      <div className="bg-lightBlue p-8 shadow-md md:w-[500px] w-4/5 rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-cream">
          註冊新帳號
        </h2>
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
          <div className="mb-4">
            <label className="block mb-2">邀請碼（可選）</label>
            <input
              type="text"
              placeholder="請輸入邀請碼"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)} // 保存用戶輸入的邀請碼
              className="w-full p-2 rounded border border-gray-300"
            />
          </div>
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="w-1/2 bg-yellow text-lightBlue py-2 rounded-full font-bold hover:bg-darkYellow "
            >
              註冊
            </button>
          </div>
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
