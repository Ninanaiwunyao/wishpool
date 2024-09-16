import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/login"); // 登出後重定向到登錄頁面
      })
      .catch((error) => {
        console.error("登出失敗:", error);
      });
  };

  return (
    <header className="z-10 fixed top-0 left-0 right-0 flex justify-between items-center bg-yellow p-4 w-4/5 mt-6 mx-auto rounded-full">
      <div>
        <Link to="/" className="text-lightBlue font-semibold ml-10 text-xl">
          首頁
        </Link>
      </div>
      <div className="flex space-x-20">
        <Link to="/wishpool" className="text-lightBlue font-semibold text-xl">
          許願池
        </Link>
        <Link to="/memberpage" className="text-lightBlue font-semibold text-xl">
          會員
        </Link>
        <Link
          to="/leaderboard"
          className="text-lightBlue font-semibold text-xl"
        >
          排行榜
        </Link>
      </div>
      <div>
        <Link
          to="/"
          className="text-lightBlue font-semibold mr-10 text-xl"
          onClick={handleLogout}
        >
          登出
        </Link>
      </div>
    </header>
  );
};
export default Header;
