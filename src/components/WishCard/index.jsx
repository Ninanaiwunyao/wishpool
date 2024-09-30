import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import coinpng from "./coin.png";
import planeIcon from "./plane.png";
import woodBG from "./wood.jpg";

const WishCard = ({ wish }) => {
  const navigate = useNavigate();

  if (!wish) {
    return <p>No wish found</p>;
  }

  const handleViewDetails = () => {
    navigate(`/wishcarddetail/${wish.id}`);
  };

  const tags = [
    { tag_category: "愛情", href: "/category?category=愛情" },
    { tag_category: "學業", href: "/category?category=學業" },
    { tag_category: "生活", href: "/category?category=生活" },
    { tag_category: "工作", href: "/category?category=工作" },
    { tag_category: "興趣", href: "/category?category=興趣" },
    { tag_category: "家庭", href: "/category?category=家庭" },
    { tag_category: "公益", href: "/category?category=公益" },
    { tag_category: "人際", href: "/category?category=人際" },
  ];

  const handleTagClick = (tag) => {
    const tagItem = tags.find((comp) => comp.tag_category === tag);
    if (tagItem) {
      navigate(tagItem.href);
    } else {
      console.error("找不到分類:", tag);
    }
  };

  return (
    <div
      className="overflow-hidden w-64 h-96 flex flex-col justify-between items-center pb-4 text-2xl font-sans bg-white rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105"
      style={{
        backgroundImage: `url(${woodBG}`, // 在 md 以上显示背景图
        backgroundSize: "cover",
        backgroundPosition: "",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full h-[160px] flex  justify-center">
        <img
          src={wish.imageUrl}
          alt={wish.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-row justify-center">
        <img src={coinpng} alt="coins" className="w-16" />
        <p className="mt-4">{wish.amount}</p>
      </div>
      <p className="text-gray-600 mb-4 mt-2 font-bold">{wish.title}</p>
      <div className="flex space-x-2 mb-4">
        {wish.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-200 text-black rounded-full px-2 py-1 text-sm cursor-pointer"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        className="flex flex-row h-12 text-lg text-darkBlue px-4 py-2 rounded hover:bg-gray-700 hover:text-cream"
        onClick={handleViewDetails}
      >
        <img src={planeIcon} alt="" className="h-10" />
        查看
      </button>
    </div>
  );
};

WishCard.propTypes = {
  wish: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    amount: PropTypes.number,
    imageUrl: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default WishCard;
