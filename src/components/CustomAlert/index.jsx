import PropTypes from "prop-types";

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-cream p-6 rounded shadow-lg flex flex-col items-center">
        <p className="text-center">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-lightBlue text-cream rounded"
        >
          確認
        </button>
      </div>
    </div>
  );
};

CustomAlert.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
export default CustomAlert;
