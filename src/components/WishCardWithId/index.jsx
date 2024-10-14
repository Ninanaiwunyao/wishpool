import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import WishCard from "@/components/WishCard";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const WishCardWithId = ({ wishId }) => {
  const [wish, setWish] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchWish = async () => {
      const wishRef = doc(db, "wishes", wishId);
      const wishDoc = await getDoc(wishRef);
      if (wishDoc.exists()) {
        setWish({ id: wishDoc.id, ...wishDoc.data() });
      }
      setLoading(false);
    };

    fetchWish();
  }, [wishId, db]);

  if (loading) {
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

          <p className="text-white text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!wish) {
    return <div>Wish not found</div>;
  }

  return <WishCard wish={wish} />;
};
WishCardWithId.propTypes = {
  wishId: PropTypes.string.isRequired,
};

export default WishCardWithId;
