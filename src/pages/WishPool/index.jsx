import { useState, useEffect } from "react";
import Slider from "react-slick";
import { WishesProvider, useWishes } from "@/WishesContext";
import WishCard from "@/components/WishCard";
import backgroundImage from "./wishpoolBG.png";
import mobileBackgroundImage from "./mobileWishpoolBG.png";

const WishPool = () => {
  const { wishes, loading } = useWishes();
  const [isMdOrAbove, setIsMdOrAbove] = useState(window.innerWidth >= 630);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setIsMdOrAbove(window.innerWidth >= 630);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width <= 630) {
        setVisibleCount(1);
      } else if (width <= 900) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredWishes = wishes
    .filter((wish) => wish.status === "open")
    .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

  const settings = {
    dots: false,
    infinite: true,
    centerMode: true,
    centerPadding: "0",
    slidesToShow: visibleCount, // 動態應用 visibleCount
    speed: 500,
    focusOnSelect: true,
  };

  return (
    <div
      className="bg-darkBlue relative w-full min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: isMdOrAbove
          ? `url(${backgroundImage})`
          : `url(${mobileBackgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Slider {...settings} className="w-full max-w-4xl mt-24">
        {filteredWishes.map((wish) => (
          <div key={wish.id} className="px-4 !flex justify-center">
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
