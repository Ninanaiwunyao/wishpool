import { useState } from "react";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import PropTypes from "prop-types";

const ProofUploadModal = ({ onClose, dreamId, wishOwnerId, wishId }) => {
  const [proofText, setProofText] = useState("");
  const [file, setFile] = useState(null);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const proofData = {
        proofText: proofText || "",
        fileUrl: file ? URL.createObjectURL(file) : null,
        timestamp: serverTimestamp(),
        uploaderId: user.uid || "unknown",
      };

      // 向 Firebase 添加證據記錄
      const proofRef = collection(db, "proofs");
      await addDoc(proofRef, proofData);

      const chatDocRef = doc(db, "chats", dreamId); // 確保這裡的 dreamId 對應的是 chatId

      // 檢查文檔是否存在
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        // 如果文檔不存在，則創建它
        await setDoc(chatDocRef, {
          participants: ["system", wishOwnerId], // 初始化參與者
        });
      } else {
        // 如果文檔已經存在，則更新它
        await updateDoc(chatDocRef, {
          participants: arrayUnion("system", wishOwnerId),
        });
      }

      // 發送系統消息到許願者的聊天室通知審核
      const messagesRef = collection(db, "chats", dreamId, "messages");
      await addDoc(messagesRef, {
        senderId: "system",
        content: `圓夢者已提交證明，請審核。`,
        timestamp: serverTimestamp(),
        messageType: "proof",
        relatedId: dreamId, // 與此證明相關的 dream ID
        wishId: wishId, // 與此證明相關的願望 ID
        dreamerId: user.uid, // 圓夢者 ID
        proofText: proofText || "", // 上傳的文字證明
        fileUrl: file ? URL.createObjectURL(file) : null,
      });

      alert("證明上傳成功，已通知許願者！");
      onClose();
    } catch (error) {
      console.error("上傳證明失敗", error);
      alert("證明上傳失敗");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">上傳圓夢證明</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            placeholder="輸入證明描述..."
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              上傳
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
ProofUploadModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  dreamId: PropTypes.string.isRequired,
  wishOwnerId: PropTypes.string.isRequired,
  wishId: PropTypes.string.isRequired,
};

export default ProofUploadModal;
