import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useWishes } from "@/WishesContext";
import WishCard from "@/components/WishCard";

const Category = () => {
  const location = useLocation();
  const { wishes, loading } = useWishes();
  const [filteredWishes, setFilteredWishes] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category");

  useEffect(() => {
    if (wishes.length > 0) {
      const filtered = wishes.filter((wish) => {
        return wish.tags.includes(category);
      });
      setFilteredWishes(filtered);
    }
  }, [wishes, category]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-darkBlue relative w-full h-fit flex flex-col items-center justify-start pt-32">
      <h2 className="text-2xl font-bold text-cream mb-4">
        {category}的所有願望
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 h-screen mb-24">
        {filteredWishes.length > 0 ? (
          filteredWishes.map((wish) => <WishCard key={wish.id} wish={wish} />)
        ) : (
          <p>沒有找到符合該標籤的願望。</p>
        )}
      </div>
    </div>
  );
};

export default Category;
