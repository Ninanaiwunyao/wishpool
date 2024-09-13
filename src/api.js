import { db } from "./firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const getUserData = async () => {
  try {
    const querySnapShot = await getDocs(collection(db, "user"));
    const data = querySnapShot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error("Error fetching data from firestore:", error);
    return [];
  }
};

export { getUserData };
