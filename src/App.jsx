import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Header from "./components/Header";
import { fairyDustCursor } from "./FairyDustCursor";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const cursorEffect = fairyDustCursor();

    return () => {
      cursorEffect.destroy();
    };
  }, []);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!isAuthenticated) {
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
          <p className="text-white text-2xl font-bold">
            正在驗證身份，請稍候...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default App;
