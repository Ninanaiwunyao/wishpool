import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const Header = () => {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("isAuthenticated");
    } catch (err) {
      console.error("登出失敗:", err.message);
    }
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
        <Link
          to="/memberpage/profile"
          className="text-lightBlue font-semibold text-xl"
        >
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
