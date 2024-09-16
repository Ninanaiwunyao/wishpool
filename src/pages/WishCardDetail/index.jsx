import { useWishes } from "@/WishesContext";
import { useParams } from "react-router-dom";

const WishCardDetail = () => {
  const { id } = useParams();
  const { wishes, loading } = useWishes();

  if (loading) {
    return <div>Loading...</div>;
  }
  const wish = wishes.find((wish) => wish.id === id);

  if (!wish) {
    return <p>No wish found with the given ID.</p>;
  }
  return (
    <div className="bg-darkblue min-h-screen flex flex-col items-center p-8 mt-32">
      <div
        key={wish.id}
        className="bg-gray-800 rounded-xl shadow-lg mt-10 p-8 w-full max-w-2xl flex"
      >
        <div className="flex-shrink-0">
          <img
            src={wish.imageUrl}
            alt={`${wish.title} image`}
            className="w-40 h-40 rounded-lg object-cover"
          />
        </div>

        <div className="text-white ml-6">
          <h3 className="text-xl font-bold mb-4">願望主旨</h3>
          <p className="mb-6">{wish.title}</p>

          <h3 className="text-xl font-bold mb-4">願望內容</h3>
          <p className="mb-6">{wish.description}</p>

          <div className="flex space-x-2 mb-6">
            {wish.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-white text-black rounded-full px-4 py-1"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-yellow-300 text-primaryBlue font-semibold rounded-full px-6 py-2 hover:bg-yellow-400">
              圓夢
            </button>
            <button className="bg-transparent text-white text-2xl">
              &#9825;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WishCardDetail;
