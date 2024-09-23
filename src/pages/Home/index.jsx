import { Link } from "react-router-dom";
import backgroundImage from "./homeBackground.png";
import gifImage from "./pool.gif";

const Home = () => {
  return (
    <div
      className="h-screen relative flex items-center justify-center min-h-[calc(100vh-144px)] bg-darkBlue"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center -90px",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative mt-64 ml-12">
        <img src={gifImage} alt="wishpool" className="w-[900px] h-auto" />

        <Link
          to="/wishform"
          className="cursor-pointer flex items-center justify-center text-xl rounded-3xl h-16 w-32 absolute left-[-200px] bottom-20 mb-4 ml-4 bg-cream text-jet font-bold py-2 px-4 shadow-lg hover:bg-gray-200"
          style={{
            boxShadow: "inset 0px 4px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          許願
        </Link>

        <Link
          to="/wishpool"
          className="cursor-pointer flex items-center justify-center text-xl rounded-3xl h-16 w-32 absolute right-[-200px] bottom-20 mb-4 mr-4 bg-cream text-jet font-bold py-2 px-4 shadow-lg hover:bg-gray-200"
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
