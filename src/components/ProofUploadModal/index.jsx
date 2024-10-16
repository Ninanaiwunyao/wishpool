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

const ProofUploadModal = ({
  onClose,
  dreamId,
  wishOwnerId,
  wishId,
  onUploadSuccess,
  setAlertMessage,
}) => {
  const [proofText, setProofText] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState(null);

  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (!["image/jpeg", "image/png", "image/jpg"].includes(fileType)) {
        setFileErrorMessage("只允許上傳圖片檔案 (JPG, PNG)。");
        setFile(null);
      } else {
        setFileErrorMessage(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !proofText) {
      setAlertMessage("請輸入文字證明以及上傳圖片。");
      return;
    }
    try {
      setIsUploading(true);
      let fileUrl = null;
      if (file) {
        const fileRef = ref(storage, `proofs/${file.name}_${Date.now()}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }
      const proofData = {
        proofText: proofText || "",
        fileUrl: fileUrl,
        timestamp: serverTimestamp(),
        uploaderId: user.uid || "unknown",
      };
      onUploadSuccess(proofData);
      const proofRef = collection(db, "proofs");
      await addDoc(proofRef, proofData);

      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", wishOwnerId)
      );
      const querySnapshot = await getDocs(q);

      let existingChat = null;

      querySnapshot.forEach((docSnapshot) => {
        const chatData = docSnapshot.data();
        if (
          chatData.participants.includes("system") &&
          chatData.participants.includes(wishOwnerId)
        ) {
          existingChat = { id: docSnapshot.id, ...chatData };
        }
      });

      let chatDocRef;

      if (existingChat) {
        chatDocRef = doc(db, "chats", existingChat.id);
      } else {
        chatDocRef = await addDoc(chatsRef, {
          participants: ["system", wishOwnerId],
          createdAt: serverTimestamp(),
        });
      }

      const messagesRef = collection(db, "chats", chatDocRef.id, "messages");
      await addDoc(messagesRef, {
        senderId: "system",
        content: `圓夢者已提交證明，請審核。`,
        timestamp: serverTimestamp(),
        messageType: "proof",
        relatedId: dreamId,
        wishId: wishId,
        dreamerId: user.uid,
        proofText: proofText || "",
        fileUrl: fileUrl,
        approved: "pending",
        readBy: [],
      });

      setAlertMessage("證明上傳成功，已通知許願者！");
    } catch (error) {
      console.error("上傳證明失敗", error);
      setAlertMessage("證明上傳失敗");
    } finally {
      setIsUploading(false);
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
          {fileErrorMessage && (
            <p className="text-red-500">{fileErrorMessage}</p>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-lightBlue text-white px-4 py-2 rounded hover:bg-darkBlue"
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
  onUploadSuccess: PropTypes.func.isRequired,
  setAlertMessage: PropTypes.func.isRequired,
};

export default ProofUploadModal;
