import { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import PropTypes from "prop-types";

const WishesContext = createContext();

export const WishesProvider = ({ children }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "wishes"));
        const wishesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWishes(wishesData);
      } catch (error) {
        console.error("Error fetching wishes data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishes();
  }, []);

  return (
    <WishesContext.Provider value={{ wishes, loading }}>
      {children}
    </WishesContext.Provider>
  );
};
WishesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export const useWishes = () => useContext(WishesContext);
