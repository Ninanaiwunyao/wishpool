import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import backgroundImage from "./homeBackground.png";
import gifImage from "./pool.gif";
import angelSit from "./angel-sit.png";
import angelStand from "./angel-stand.png";
import mobileBG from "./mobileBG.png";

const Home = () => {
  const [isMdOrAbove, setIsMdOrAbove] = useState(window.innerWidth >= 1245);

  // 当窗口大小变化时，更新状态以控制背景图片显示
  useEffect(() => {
    const handleResize = () => {
      setIsMdOrAbove(window.innerWidth >= 1245);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="h-screen relative flex items-center justify-center min-h-screen bg-darkBlue"
      style={{
        backgroundImage: isMdOrAbove
          ? `url(${backgroundImage})`
          : `url(${mobileBG})`, // 在 md 以上显示背景图
        backgroundSize: "cover",
        backgroundPosition: isMdOrAbove ? "center -90px" : "",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="h-full relative md:mt-64 md:ml-12 flex flex-col md:justify-center items-center gap-7 md:h-96 mt-48">
        <img
          src={angelSit}
          alt="angelSit"
          className="absolute bottom-36 right-2 h-36 md:hidden"
        />
        <img
          src={angelStand}
          alt="angelStand"
          className="absolute bottom-36 left-2 h-36 md:hidden"
        />
        <img src={gifImage} alt="wishpool" className="w-[700px] h-auto" />
        <Link
          to="/wishform"
          className="cursor-pointer flex items-center justify-center text-xl rounded-3xl h-16 w-32 md:absolute md:left-[-200px] md:bottom-20 md:mb-4 md:ml-4 bg-cream text-jet font-bold py-2 px-4 shadow-lg hover:bg-gray-200"
          style={{
            boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          許願
        </Link>

        <Link
          to="/wishpool"
          className="cursor-pointer flex items-center justify-center text-xl rounded-3xl h-16 w-32 md:absolute md:right-[-200px] md:bottom-20 md:mb-4 md:mr-4 bg-cream text-jet font-bold py-2 px-4 shadow-lg hover:bg-gray-200"
          style={{
            boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          圓夢
        </Link>
      </div>
    </div>
  );
};
export default Home;
