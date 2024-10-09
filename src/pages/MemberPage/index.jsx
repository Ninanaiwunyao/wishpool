import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import arrowicon from "./311747.svg";
import backgroundImage from "./starBG.png";
import MobileBackgroundImage from "./MobileStarBG.png";

const MemberPage = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSmOrBelow, setIsSmOrBelow] = useState(window.innerWidth <= 641);
  useEffect(() => {
    const handleResize = () => {
      setIsSmOrBelow(window.innerWidth <= 641);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };
  return (
    <div
      className="flex bg-darkBlue items-center h-fit md:min-h-screen "
      style={{
        backgroundImage: isSmOrBelow
          ? `url(${MobileBackgroundImage})`
          : `url(${backgroundImage})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      }}
    >
      <button
        onClick={toggleNav}
        className="fixed left-0 top-64 p-2 bg-yellow text-darkBlue rounded-r-3xl md:hidden z-50"
      >
        {isNavOpen ? (
          <img src={arrowicon} alt="➡" className="h-6 transform scale-x-[-1]" />
        ) : (
          <img src={arrowicon} alt="➡" className="h-6" />
        )}{" "}
        {/* 展開或收起的箭頭 */}
      </button>

      <nav
        className={`fixed left-0 top-64 bg-lightBlue h-64 w-48 p-4 flex flex-col justify-center items-center rounded-r-3xl shadow-lg transform transition-transform duration-300 z-40 ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:flex`}
      >
        <ul className="space-y-4 text-xl">
          <li>
            <NavLink
              to="/memberpage/profile"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-white hover:text-yellow"
              }
              onClick={() => setIsNavOpen(false)}
            >
              個人檔案
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/memberpage/favorites"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-white hover:text-yellow"
              }
              onClick={() => setIsNavOpen(false)}
            >
              收藏區
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/memberpage/progress"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-white hover:text-yellow"
              }
              onClick={() => setIsNavOpen(false)}
            >
              圓夢進度
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/memberpage/message"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-white hover:text-yellow"
              }
              onClick={() => setIsNavOpen(false)}
            >
              收件區
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/memberpage/transaction"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-white hover:text-yellow"
              }
              onClick={() => setIsNavOpen(false)}
            >
              硬幣紀錄
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 右側內容 */}
      <div className="flex-1 p-0">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberPage;
