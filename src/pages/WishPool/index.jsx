import Slider from "react-slick";
import { WishesProvider, useWishes } from "@/WishesContext";
import WishCard from "@/components/WishCard";
import backgroundImage from "./homeBackground.png";

const WishPool = () => {
  const { wishes, loading } = useWishes();

  if (loading) {
    return <div>Loading...</div>;
  }
  const filteredWishes = wishes.filter((wish) => wish.status === "open");
  const settings = {
    dots: false,
    infinite: true,
    centerMode: true,
    centerPadding: "0",
    slidesToShow: 3,
    speed: 500,
    focusOnSelect: true,
  };

  return (
    <div
      className="bg-darkBlue relative w-full min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Slider {...settings} className="w-full max-w-4xl mt-24">
        {filteredWishes.map((wish) => (
          <div key={wish.id} className="px-4">
            <WishCard wish={wish} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

const WishPoolWithProvider = () => (
  <WishesProvider>
    <WishPool />
  </WishesProvider>
);

export default WishPoolWithProvider;
