import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import angelSit from "./angel-sit.png";
import angelStand from "./angel-stand.png";
import backgroundImage from "./homeBackground.png";
import mobileBG from "./mobileBG.png";
import gifImage from "./pool.gif";

const Home = () => {
  const [isMdOrAbove, setIsMdOrAbove] = useState(window.innerWidth >= 1245);

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
      className="h-fit relative pb-6 flex items-center justify-center min-h-screen bg-darkBlue"
      style={{
        backgroundImage: isMdOrAbove
          ? `url(${backgroundImage})`
          : `url(${mobileBG})`,
        backgroundSize: "cover",
        backgroundPosition: isMdOrAbove ? "center -90px" : "",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="h-full relative md:mt-64 md:ml-12 flex flex-col md:justify-center items-center gap-7 md:h-96 mt-48">
        <img
          src={angelSit}
          alt="angelSit"
          className="absolute bottom-0 right-2 h-36 md:hidden"
        />
        <img
          src={angelStand}
          alt="angelStand"
          className="absolute bottom-0 left-2 h-36 md:hidden"
        />
        <img src={gifImage} alt="wishpool" className="w-[700px] h-auto" />
        <Link
          to="/wishform"
          className="cursor-pointer flex items-center justify-center text-xl rounded-3xl h-16 w-32 md:absolute md:left-[-200px] md:bottom-20 md:mb-4 md:ml-4 bg-white text-jet font-bold py-2 px-4 shadow-lg hover:bg-gray-200"
          style={{
            boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          許願
        </Link>

        <Link
          to="/wishpool"
          className="cursor-pointer flex items-center justify-center text-xl rounded-3xl h-16 w-32 md:absolute md:right-[-200px] md:bottom-20 md:mb-4 md:mr-4 bg-white text-jet font-bold py-2 px-4 shadow-lg hover:bg-gray-200"
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
