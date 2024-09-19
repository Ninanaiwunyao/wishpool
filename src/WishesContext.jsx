import { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import PropTypes from "prop-types";

const WishesContext = createContext();

export const WishesProvider = ({ children }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wishesRef = collection(db, "wishes");

    // 使用 onSnapshot 监听数据变化
    const unsubscribe = onSnapshot(wishesRef, (snapshot) => {
      const wishesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishes(wishesData);
      setLoading(false);
    });

    // 在组件卸载时取消监听
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
