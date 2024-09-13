import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex justify-between items-center bg-yellow p-4 w-4/5 mt-6 mx-auto rounded-full">
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
        <Link to="/" className="text-lightBlue font-semibold mr-10 text-xl">
          登出
        </Link>
      </div>
    </header>
  );
};
export default Header;
