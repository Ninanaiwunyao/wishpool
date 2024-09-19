import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import WishCard from "@/components/WishCard";
import PropTypes from "prop-types";

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
    return <div>Loading...</div>;
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
