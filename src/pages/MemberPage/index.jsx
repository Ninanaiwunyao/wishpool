import { Outlet, NavLink } from "react-router-dom";

const MemberPage = () => {
  return (
    <div className="flex bg-darkBlue items-center min-h-[calc(100vh-64px)]">
      <nav className="fixed left-0 top-64 bg-lightBlue h-64 w-48 p-4 flex flex-col justify-center items-center rounded-r-3xl shadow-lg">
        <ul className="space-y-4 text-xl">
          <li>
            <NavLink
              to="/memberpage/profile"
              className={({ isActive }) =>
                isActive ? "text-yellow" : "text-cream hover:text-yellow"
              }
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
            >
              硬幣紀錄
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 右側內容 */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberPage;
