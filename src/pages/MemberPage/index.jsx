import { Outlet } from "react-router-dom";

const MemberPage = () => {
  return (
    <div>
      <h1>Member Page</h1>
      <Outlet />
    </div>
  );
};
export default MemberPage;
