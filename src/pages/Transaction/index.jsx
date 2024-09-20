import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import coinspng from "./coin.png"; // 系統通知頭像

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [filterType, setFilterType] = useState(""); // Empty means no filter
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        // Fetch transactions where the userId matches the logged-in user
        const transactionsRef = collection(db, "transactions");
        const q = query(
          transactionsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);

        const fetchedTransactions = [];
        let total = 0;

        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();

          fetchedTransactions.push({
            id: docSnapshot.id,
            ...data,
          });

          total += data.amount; // Sum up the total coins for the user
        });

        setTransactions(fetchedTransactions);
        setTotalCoins(total);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [db, user]);

  const filteredTransactions = transactions.filter((transaction) =>
    filterType === "income" ? transaction.amount > 0 : transaction.amount < 0
  );
  return (
    <div className="bg-darkBlue min-h-screen p-8 flex flex-col">
      <div className="ml-24 text-2xl font-bold text-cream mb-6 mt-16">
        硬幣紀錄
      </div>

      <div className="flex items-center ml-24 mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <img src={coinspng} alt="Coins" className="w-8 h-8 mr-2" />
            <span className="text-xl text-darkBlue font-bold">
              {totalCoins}
            </span>
          </div>

          <div className="ml-4 flex">
            <button
              className={`px-4 py-2 ${
                filterType === "income"
                  ? "bg-lightBlue text-white"
                  : "bg-gray-300 text-darkBlue"
              } rounded-l-lg${
                filterType === "income"
                  ? "bg-lightBlue text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setFilterType("income")}
            >
              收入
            </button>
            <button
              className={`px-4 py-2 font-bold  ${
                filterType === "expense"
                  ? "bg-lightBlue text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setFilterType("expense")}
            >
              支出
            </button>
          </div>
        </div>
      </div>

      <div className="ml-24 flex flex-col w-4/5">
        {transactions.length === 0 ? (
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
                    : transaction.type}
                </p>
                <p className="text-gray-500">
                  {new Date(
                    transaction.timestamp.toDate()
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="text-xl font-bold text-darkBlue">
                {transaction.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;
