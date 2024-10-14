import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWishes } from "@/WishesContext";
import WishCard from "@/components/WishCard";
import { motion } from "framer-motion";
import CustomAlert from "@/components/CustomAlert";

const Category = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishes, loading } = useWishes();
  const [filteredWishes, setFilteredWishes] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category");
  useEffect(() => {
    if (!category) {
      setAlertMessage("請選擇一個有效的分類");
      const timer = setTimeout(() => {
        navigate("/");
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setAlertMessage(null);
    }
  }, [category, navigate]);

  useEffect(() => {
    if (wishes.length > 0 && category) {
      const filtered = wishes.filter((wish) => wish.tags.includes(category));
      setFilteredWishes(filtered);
    }
  }, [wishes, category]);
  if (loading) {
    <div className="flex items-center justify-center h-screen bg-darkBlue">
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-6 bg-yellow rounded-full animate-bounce"></div>
          <div className="w-6 h-6 bg-lightBlue rounded-full animate-bounce delay-100"></div>
          <div className="w-6 h-6 bg-white rounded-full animate-bounce delay-200"></div>
        </motion.div>

        <p className="text-white text-2xl font-bold">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="bg-darkBlue relative w-full min-h-screen h-fit flex flex-col items-center justify-start pt-32">
      <h2 className="text-2xl font-bold text-white mb-4">
        {category}的所有願望
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 h-fit mb-24 ">
        {filteredWishes.length > 0 ? (
          filteredWishes.map((wish) => <WishCard key={wish.id} wish={wish} />)
        ) : (
          <p className="text-white">沒有找到符合該標籤的願望。</p>
        )}
      </div>
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default Category;
