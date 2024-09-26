import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import arrowicon from "./311747.svg";

const MemberPage = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };
  return (
    <div className="flex bg-darkBlue items-center h-full md:min-h-screen ">
      <button
        onClick={toggleNav}
        className="fixed left-0 top-64 z-20 p-2 bg-yellow text-darkBlue rounded-r-3xl md:hidden"
      >
        {isNavOpen ? (
          <img src={arrowicon} alt="➡" className="h-6 transform scale-x-[-1]" />
        ) : (
          <img src={arrowicon} alt="➡" className="h-6" />
        )}{" "}
        {/* 展開或收起的箭頭 */}
      </button>

      <nav
        className={`fixed left-0 top-64 bg-lightBlue h-64 w-48 p-4 flex flex-col justify-center items-center rounded-r-3xl shadow-lg z-10 transform transition-transform duration-300 ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:flex`}
      >
        <ul className="space-y-4 text-xl">
          <li>
            <NavLink
              to="/memberpage/profile"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-cream hover:text-yellow"
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
                isActive ? "text-yellow" : "text-cream hover:text-yellow"
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
                isActive ? "text-yellow" : "text-cream hover:text-yellow"
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
                isActive ? "text-yellow" : "text-cream hover:text-yellow"
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
                isActive ? "text-yellow" : "text-cream hover:text-yellow"
              }
              onClick={() => setIsNavOpen(false)}
            >
              硬幣紀錄
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 右側內容 */}
      <div className="flex-1 p-0 md:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberPage;
