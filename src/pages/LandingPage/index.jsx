import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import starIcon from "./starIcon.png";
import backgroundImage from "./landingPageBG.jpg";
import gifImage from "./pool.gif";

const getRandomValue = (min, max) => Math.random() * (max - min) + min;

const LandingPage = () => {
  const [floatingElements, setFloatingElements] = useState([]);

  const generateFloatingElements = () => {
    const elements = [];
    for (let i = 0; i < 20; i++) {
      elements.push({
        id: i,
        size: getRandomValue(
          window.innerWidth * 0.02,
          window.innerWidth * 0.04
        ),
        startX: getRandomValue(0, 100),
        delay: getRandomValue(3, 10),
        duration: getRandomValue(15, 25),
      });
    }
    setFloatingElements(elements);
  };
  useEffect(() => {
    generateFloatingElements();

    const handleResize = () => {
      generateFloatingElements();
    };

    window.addEventListener("resize", handleResize);

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
        className=" max-w-[750px] w-[40vw] h-auto absolute top-[80px] sm:top-36 msm:top-48 md:top-80 left-6 md:left-16 lg:top-[500px] lg:left-[200px]"
      />
      <Link
        to="/login"
        className="flex justify-center items-center bg-yellow text-lightBlue font-semibold text-[10px]  rounded-full hover:bg-darkYellow absolute top-[20%] sm:top-80 right-[25%] sm:right-52 msm:top-[18%] md:right-[430px] lg:top-[900px] lg:right-[680px] w-16 h-6 sm:h-12 sm:w-24 md:h-20 md:w-40 sm:text-sm md:text-2xl"
      >
        立即入池
      </Link>

      {floatingElements.map((element) => (
        <motion.img
          key={element.id}
          src={starIcon}
          alt="Star Icon"
          className="absolute"
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.startX}%`,
          }}
          initial={{ top: "-10%" }}
          animate={{
            top: "95%",
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default LandingPage;
