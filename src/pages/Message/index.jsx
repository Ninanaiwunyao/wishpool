import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usernames, setUsernames] = useState({});
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", user.uid)
      );
      const querySnapshot = await getDocs(q);

      const fetchedChats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(fetchedChats);
      setLoading(false);

      // Fetch user information for participants
      const participantsSet = new Set();
      fetchedChats.forEach((chat) =>
        chat.participants.forEach((participant) =>
          participantsSet.add(participant)
        )
      );

      const fetchUsernames = async () => {
        const usernamesMap = {};
        for (const participant of participantsSet) {
          if (participant === "system") {
            usernamesMap[participant] = "系統通知";
          } else {
            const userRef = doc(db, "users", participant);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              usernamesMap[participant] =
                userDoc.data().userName || participant;
            } else {
              usernamesMap[participant] = participant; // fallback to userId if username not found
            }
          }
        }
        setUsernames(usernamesMap);
      };

      fetchUsernames();
    };

    fetchChats();
  }, [user, db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-darkBlue min-h-screen p-8">
      <h2 className="text-2xl font-bold text-cream mb-6 mt-32">聊天室</h2>
      {chats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
              onClick={() => navigate(`/memberpage/chat/${chat.id}`)}
            >
              <h3 className="text-darkBlue">聊天室ID: {chat.id}</h3>
              <p className="text-darkBlue">
                參與者:{" "}
                {chat.participants
                  .map((participant) => usernames[participant] || participant)
                  .join(", ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">目前沒有聊天室。</p>
      )}
    </div>
  );
};

export default Messages;
