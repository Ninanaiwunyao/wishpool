const Footer = () => {
  return (
    <footer className="bg-lightBlue py-6 absolute h-16 text-white flex w-full">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex space-x-6">
          <a href="#" className="text-primaryBlue hover:text-blue-800">
            Facebook
          </a>
          <a href="#" className="text-primaryBlue hover:text-blue-800">
            Twitter
          </a>
          <a href="#" className="text-primaryBlue hover:text-blue-800">
            Instagram
          </a>
        </div>
        <div className="text-center md:text-left text-primaryBlue mb-4 md:mb-0">
          © 2024 許願池. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-primaryBlue hover:text-blue-800">
            關於我們
          </a>
          <a href="#" className="text-primaryBlue hover:text-blue-800">
            服務條款
          </a>
          <a href="#" className="text-primaryBlue hover:text-blue-800">
            隱私政策
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
