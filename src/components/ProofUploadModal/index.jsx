import { useState } from "react";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PropTypes from "prop-types";

const ProofUploadModal = ({ onClose, dreamId, wishOwnerId, wishId }) => {
  const [proofText, setProofText] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // 上傳狀態
  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let fileUrl = null;
      if (file) {
        const fileRef = ref(storage, `proofs/${file.name}_${Date.now()}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef); // 獲取上傳後的下載 URL
      }
      const proofData = {
        proofText: proofText || "",
        fileUrl: fileUrl,
        timestamp: serverTimestamp(),
        uploaderId: user.uid || "unknown",
      };

      // 向 Firebase 添加證據記錄
      const proofRef = collection(db, "proofs");
      await addDoc(proofRef, proofData);

      // 查詢是否已經存在 `system` 和 `wishOwnerId` 的聊天室
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", wishOwnerId)
      );
      const querySnapshot = await getDocs(q);

      let existingChat = null;

      querySnapshot.forEach((docSnapshot) => {
        const chatData = docSnapshot.data();
        // 檢查聊天室是否包含 `system` 和 `wishOwnerId`
        if (
          chatData.participants.includes("system") &&
          chatData.participants.includes(wishOwnerId)
        ) {
          existingChat = { id: docSnapshot.id, ...chatData };
        }
      });

      let chatDocRef;

      if (existingChat) {
        // 如果找到現有聊天室，使用該聊天室
        console.log("找到現有聊天室:", existingChat.id);
        chatDocRef = doc(db, "chats", existingChat.id);
      } else {
        // 如果沒有找到聊天室，則創建新的聊天室
        console.log("未找到聊天室，創建新的聊天室");
        chatDocRef = await addDoc(chatsRef, {
          participants: ["system", wishOwnerId],
          createdAt: serverTimestamp(),
        });
      }

      // 發送系統消息到聊天室通知審核
      const messagesRef = collection(db, "chats", chatDocRef.id, "messages");
      await addDoc(messagesRef, {
        senderId: "system",
        content: `圓夢者已提交證明，請審核。`,
        timestamp: serverTimestamp(),
        messageType: "proof",
        relatedId: dreamId, // 與此證明相關的 dream ID
        wishId: wishId, // 與此證明相關的願望 ID
        dreamerId: user.uid, // 圓夢者 ID
        proofText: proofText || "", // 上傳的文字證明
        fileUrl: fileUrl,
        approved: false,
        readBy: [],
      });

      alert("證明上傳成功，已通知許願者！");
      onClose();
    } catch (error) {
      console.error("上傳證明失敗", error);
      alert("證明上傳失敗");
    } finally {
      setIsUploading(false); // 上傳結束
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
              disabled={isUploading}
            >
              {isUploading ? "上傳中..." : "上傳"}
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
