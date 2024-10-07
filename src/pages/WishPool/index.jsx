import { WishesProvider, useWishes } from "@/WishesContext";
import WishCard from "@/components/WishCard";
import backgroundImage from "./wishpoolBG.png";
import mobileBackgroundImage from "./mobileWishpoolBG.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

const WishPool = () => {
  const { wishes, loading } = useWishes();
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isMdOrAbove, setIsMdOrAbove] = useState(window.innerWidth >= 630);

  // 当窗口大小变化时，更新状态以控制背景图片显示
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
    return (
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

          {/* Loading Message */}
          <p className="text-white text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }
  const filteredWishes = wishes
    .filter((wish) => wish.status === "open")
    .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

  const indexInArrayScope =
    ((activeIndex % filteredWishes.length) + filteredWishes.length) %
    filteredWishes.length;

  const visibleItems = [...filteredWishes, ...filteredWishes].slice(
    indexInArrayScope,
    indexInArrayScope + visibleCount
  );
  const handleClick = (newDirection) => {
    setActiveIndex((prevIndex) => [prevIndex[0] + newDirection, newDirection]);
  };
  const handleDragEnd = (event, info) => {
    const dragDistance = info.offset.x;
    const threshold = 100;

    if (dragDistance > threshold) {
      handleClick(-1);
    } else if (dragDistance < -threshold) {
      handleClick(1);
    }
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
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => handleClick(-1)}
        className="text-white"
      >
        ◀︎
      </motion.button>
      <AnimatePresence
        mode="popLayout"
        initial={false}
        className="md:w-full w-4/5 max-w-4xl mt-24"
      >
        {visibleItems.map((wish) => (
          <motion.div
            key={wish.id}
            className="px-4"
            layout
            custom={{
              direction,
              position: () => {
                if (filteredWishes === visibleItems[0]) {
                  return "left";
                } else if (filteredWishes === visibleItems[1]) {
                  return "center";
                } else {
                  return "right";
                }
              },
            }}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <WishCard wish={wish} />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => handleClick(1)}
        className="text-white"
      >
        ▶︎
      </motion.button>
    </div>
  );
};
const variants = {
  enter: ({ direction }) => {
    return { scale: 0.2, x: direction < 1 ? 50 : -50, opacity: 0 };
  },
  center: ({ position, direction }) => {
    return {
      scale: position() === "center" ? 1 : 0.9,
      x: 0,
      zIndex: getZIndex({ position, direction }),
      opacity: 1,
    };
  },
  exit: ({ direction }) => {
    return { scale: 0.2, x: direction < 1 ? -50 : 50, opacity: 0 };
  },
};

function getZIndex({ position, direction }) {
  const indexes = {
    left: direction > 0 ? 2 : 1,
    center: 3,
    right: direction > 0 ? 1 : 2,
  };
  return indexes[position()];
}

const WishPoolWithProvider = () => (
  <WishesProvider>
    <WishPool />
  </WishesProvider>
);

export default WishPoolWithProvider;
