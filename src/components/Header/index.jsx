import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import starIcon from "./starIcon.png";

const Header = () => {
  const auth = getAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("isAuthenticated");
    } catch (err) {
      console.error("登出失敗:", err.message);
    }
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <header className="md:h-14 h-10 z-50 fixed top-0 left-0 right-0 flex justify-between items-center bg-yellow p-4 w-4/5 mt-6 mx-auto rounded-full">
      <button
        onClick={toggleMenu}
        className="block md:hidden ml-10 text-xl text-lightBlue font-semibold"
      >
        選單
      </button>
      <div className="hidden sm:flex sm:flex-row ">
        <NavLink
          to="/"
          className="hidden md:block text-lightBlue font-semibold ml-10 text-xl relative"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <img
                  src={starIcon}
                  alt="Active Indicator"
                  className="absolute right-10 w-6 h-6"
                />
              )}
              首頁
            </>
          )}
        </NavLink>
      </div>
      <div className="hidden md:flex space-x-20 items-center justify-center flex-grow">
        <div className="flex space-x-20 ">
          <NavLink
            to="/wishpool"
            className="text-lightBlue font-semibold text-xl relative"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <img
                    src={starIcon}
                    alt="Active Indicator"
                    className="w-6 h-6 absolute right-16"
                  />
                )}
                許願池
              </>
            )}
          </NavLink>
          <NavLink
            to="/memberpage/profile"
            className="text-lightBlue font-semibold text-xl relative"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <img
                    src={starIcon}
                    alt="Active Indicator"
                    className="absolute right-10 w-6 h-6"
                  />
                )}
                會員
              </>
            )}
          </NavLink>
          <NavLink
            to="/leaderboard"
            className="text-lightBlue font-semibold text-xl relative"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <img
                    src={starIcon}
                    alt="Active Indicator"
                    className="absolute right-16 w-6 h-6"
                  />
                )}
                排行榜
              </>
            )}
          </NavLink>
        </div>
      </div>
      <div>
        <NavLink
          to="/"
          className="text-lightBlue font-semibold mr-10 text-xl"
          onClick={handleLogout}
        >
          登出
        </NavLink>
      </div>
      {isMenuOpen && (
        <div className="absolute top-10 left-4 w-1/8 bg-lightBlue rounded-lg shadow-lg p-4 space-y-4 md:hidden">
          <NavLink
            to="/"
            className="text-yellow font-semibold text-lg block"
            onClick={() => setIsMenuOpen(false)}
          >
            首頁
          </NavLink>
          <NavLink
            to="/wishpool"
            className="text-yellow font-semibold text-lg block"
            onClick={() => setIsMenuOpen(false)}
          >
            許願池
          </NavLink>
          <NavLink
            to="/memberpage/profile"
            className="text-yellow font-semibold text-lg block"
            onClick={() => setIsMenuOpen(false)}
          >
            會員
          </NavLink>
          <NavLink
            to="/leaderboard"
            className="text-yellow font-semibold text-lg block"
            onClick={() => setIsMenuOpen(false)}
          >
            排行榜
          </NavLink>
        </div>
      )}
    </header>
  );
};
export default Header;
