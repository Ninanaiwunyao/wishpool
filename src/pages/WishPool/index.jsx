import { WishesProvider, useWishes } from "@/WishesContext";
import WishCard from "@/components/WishCard";
import backgroundImage from "./homeBackground.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

const WishPool = () => {
  const { wishes, loading } = useWishes();
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    // 监听窗口大小变化
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

    updateVisibleCount(); // 初始化
    window.addEventListener("resize", updateVisibleCount); // 监听窗口变化

    return () => window.removeEventListener("resize", updateVisibleCount); // 清除监听器
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  const filteredWishes = wishes.filter((wish) => wish.status === "open");

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
    const threshold = 100; // 拖动超过 100px 切换

    if (dragDistance > threshold) {
      handleClick(-1); // 向右拖动，切换到前一个
    } else if (dragDistance < -threshold) {
      handleClick(1); // 向左拖动，切换到下一个
    }
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
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => handleClick(-1)}
        className="text-cream"
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
            drag="x" // 允许横向拖拽
            dragConstraints={{ left: 0, right: 0 }} // 限制拖动方向
            onDragEnd={handleDragEnd} // 拖动结束后触发事件
          >
            <WishCard wish={wish} />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => handleClick(1)}
        className="text-cream"
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
