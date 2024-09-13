import { useEffect, useState } from "react";
import { getUserData } from "@/api";
const Profile = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const userData = await getUserData(); // 獲取用戶數據
        setUsers(userData); // 更新用戶數據狀態
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false); // 確保不論成功或失敗都會結束加載狀態
      }
    };

    getUsers(); // 正確地調用異步函數
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <h2>個人檔案</h2>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="mb-6 flex items-center">
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
              <img src={user.achievements} />
              <p>用戶名稱：{user.userName}</p>
              <p>level：{user.level}</p>
              <p>信譽分數：{user.reputation}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No user</p>
      )}
    </div>
  );
};
export default Profile;
