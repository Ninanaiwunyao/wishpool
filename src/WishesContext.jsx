import { collection, onSnapshot } from "firebase/firestore";
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "./firebase/firebaseConfig";

const WishesContext = createContext();

export const WishesProvider = ({ children }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wishesRef = collection(db, "wishes");

    const unsubscribe = onSnapshot(wishesRef, (snapshot) => {
      const wishesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishes(wishesData);
      setLoading(false);
    });

    return () => unsubscribe();
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
