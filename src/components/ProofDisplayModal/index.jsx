import PropTypes from "prop-types";

const ProofDisplayModal = ({ proof, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">圓夢證明</h3>
        <p>{proof.proofText}</p>
        {proof.fileUrl && (
          <img
            src={proof.fileUrl}
            alt="Proof"
            className="w-full mt-4 rounded-lg"
          />
        )}
        <button
          onClick={onClose}
          className="bg-lightBlue text-white px-4 py-2 rounded mt-6"
        >
          關閉
        </button>
      </div>
    </div>
  );
};

ProofDisplayModal.propTypes = {
  proof: PropTypes.shape({
    proofText: PropTypes.string,
    fileUrl: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProofDisplayModal;
