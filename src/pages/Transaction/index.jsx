import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import coinspng from "./coin.png";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [userCoins, setUserCoins] = useState(0);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserCoins(userDoc.data().coins || 0);
        }
      }
    };

    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const transactionsRef = collection(db, "transactions");
        const q = query(
          transactionsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);

        const fetchedTransactions = [];

        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();

          fetchedTransactions.push({
            id: docSnapshot.id,
            ...data,
          });
        });

        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchUserCoins();
    fetchTransactions();
  }, [db, user]);

  const filteredTransactions = filterType
    ? transactions.filter((transaction) =>
        filterType === "income"
          ? transaction.amount > 0
          : transaction.amount < 0
      )
    : transactions;

  return (
    <div className="p-8 flex flex-col md:ml-40 h-fit mt-12 min-h-screen ">
      <div className="flex justify-center md:justify-start">
        <div className="md:ml-24 text-2xl font-bold text-white mb-6 md:mt-16 mt-4">
          硬幣紀錄
        </div>
      </div>
      <div className="flex items-center justify-center md:justify-start md:ml-24 mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <img src={coinspng} alt="Coins" className="w-8 h-8 mr-2" />
            <span className="text-xl text-darkBlue font-bold">{userCoins}</span>
          </div>

          <div className="ml-4 flex">
            <button
              className={`px-4 py-2 font-bold ${
                filterType === "income"
                  ? "bg-lightBlue text-white"
                  : "bg-gray-300 text-darkBlue"
              } rounded-l-lg`}
              onClick={() => setFilterType("income")}
            >
              收入
            </button>
            <button
              className={`px-4 py-2 font-bold ${
                filterType === "expense"
                  ? "bg-lightBlue text-white"
                  : "bg-gray-300 text-darkBlue"
              } rounded-r-lg`}
              onClick={() => setFilterType("expense")}
            >
              支出
            </button>
          </div>
        </div>
      </div>

      <div className=" md:ml-24 flex flex-col md:w-4/5 h-fit">
        {filteredTransactions.length === 0 ? (
          <p className="text-white">目前沒有交易紀錄。</p>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center mb-4"
            >
              <div>
                <p className="text-darkBlue font-bold">
                  {transaction.type === "dream-completion"
                    ? "圓夢"
                    : transaction.type === "make-wish"
                    ? "許願"
                    : transaction.type === "registration-bonus"
                    ? "註冊禮"
                    : transaction.type === "invitation-bonus"
                    ? "邀請獎勵"
                    : transaction.type}
                </p>
                <p className="text-gray-500">
                  {new Date(
                    transaction.timestamp.toDate()
                  ).toLocaleDateString()}
                </p>
              </div>

              <div
                className={`text-xl font-bold ${
                  transaction.amount > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {transaction.amount > 0
                  ? `+${transaction.amount}`
                  : transaction.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
