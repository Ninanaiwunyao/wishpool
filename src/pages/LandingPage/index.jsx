import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import starIcon from "./starIcon.png"; // 引入 starIcon 圖片
import backgroundImage from "./landingPageBG.jpg"; // 引入 starIcon 圖片
import gifImage from "./pool.gif";

// 生成隨機範圍的數值
const getRandomValue = (min, max) => Math.random() * (max - min) + min;

const LandingPage = () => {
  // 創建多個隨機浮動的元素
  const [floatingElements, setFloatingElements] = useState([]);

  const generateFloatingElements = () => {
    const elements = [];
    for (let i = 0; i < 20; i++) {
      elements.push({
        id: i,
        size: getRandomValue(
          window.innerWidth * 0.02,
          window.innerWidth * 0.04
        ), // 隨機大小
        startX: getRandomValue(0, 100), // 隨機 X 軸初始位置（相對於螢幕寬度百分比）
        delay: getRandomValue(3, 10), // 調整漂浮動畫的隨機延遲，最小延遲為 3 秒
        duration: getRandomValue(15, 25), // 調整漂浮速度（掉落時間），範圍在 15 到 25 秒之間
      });
    }
    setFloatingElements(elements);
  };
  useEffect(() => {
    generateFloatingElements(); // 初始化浮動元素

    // 監聽螢幕大小變化
    const handleResize = () => {
      generateFloatingElements();
    };

    window.addEventListener("resize", handleResize);

    // 清理事件監聽器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-fit">
      <img
        src={backgroundImage}
        alt="Background"
        className="w-full h-full  mx-auto my-auto"
        style={{ zIndex: -1 }}
      />
      <img
        src={gifImage}
        alt="wishpool"
        className=" max-w-[750px] w-[40vw] h-auto absolute top-[80px] sm:top-36 md:top-80 left-6 md:left-16 lg:top-[500px] lg:left-[200px]"
      />
      <Link
        to="/login"
        className="flex justify-center items-center bg-yellow text-lightBlue font-semibold text-[10px]  rounded-full hover:bg-darkYellow absolute top-[160px] sm:top-80 right-24 sm:right-52 md:top-[600px] md:right-[430px] lg:top-[900px] lg:right-[680px] w-16 h-6 sm:h-12 sm:w-24 md:h-20 md:w-40 sm:text-sm md:text-2xl"
      >
        立即入池
      </Link>

      {/* Particles Background - 浮動元素 */}
      {floatingElements.map((element) => (
        <motion.img
          key={element.id}
          src={starIcon}
          alt="Star Icon"
          className="absolute"
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.startX}%`, // 以螢幕寬度的百分比設置 X 軸位置
          }}
          initial={{ top: "-10%" }} // 元素從螢幕上方掉下來
          animate={{
            top: "95%", // 掉到螢幕下方
          }}
          transition={{
            duration: element.duration, // 掉落時間（加大範圍，使掉落更平滑）
            delay: element.delay, // 延遲掉落（避免多顆星星同時掉落）
            repeat: Infinity, // 無限次重複
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default LandingPage;
