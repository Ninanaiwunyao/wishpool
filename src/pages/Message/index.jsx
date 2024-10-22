import MemberPage from "@/pages/MemberPage";
import { useChatDetails, useUnreadMessages } from "@/UnreadMessagesContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import angelMail from "./angel-mail.png";

const Messages = () => {
  const navigate = useNavigate();
  const unreadMessagesCount = useUnreadMessages();
  const { chats, chatInfo } = useChatDetails();

  return (
    <>
      <div className=" p-8 md:ml-40 h-fit min-h-screen mt-16 md:mt-28 flex flex-col items-center md:items-start md:justify-start">
        <h2 className="text-2xl font-bold text-white mb-6 md:ml-24 ">聊天室</h2>
        {chats.length > 0 ? (
          <div className="flex flex-col md:w-4/5 w-full md:ml-24">
            {chats.map((chat) => {
              const chatDetails = chatInfo[chat.id];
              return (
                <div
                  key={chat.id}
                  className="bg-white p-4 shadow-md cursor-pointer border-b-4"
                  onClick={() => navigate(`/memberpage/chat/${chat.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {chatDetails ? (
                        <>
                          <img
                            src={chatDetails.userInfo.avatarUrl}
                            alt="头像"
                            className="w-10 h-10 rounded-full mr-4"
                          />
                          <div>
                            <p className="text-darkBlue font-bold">
                              {chatDetails.userInfo.userName}
                            </p>
                            <p className="text-gray-500">
                              {chatDetails.lastMessage.content.length > 30
                                ? chatDetails.lastMessage.content.slice(0, 30) +
                                  "..."
                                : chatDetails.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(
                                chatDetails.lastMessage.timestamp
                              ).toLocaleString("zh-TW", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })}
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-darkBlue">無訊息</p>
                      )}
                    </div>
                    {chatDetails?.unreadCount > 0 && (
                      <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                        {chatDetails.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white ml-24">目前沒有聊天室。</p>
        )}
        <motion.div
          animate={{ y: ["0%", "-10%", "0%"] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className=" hidden md:block absolute bottom-36 right-0"
        >
          <img src={angelMail} alt="" className="h-full" />
        </motion.div>
      </div>
      <MemberPage unreadMessagesCount={unreadMessagesCount} />
    </>
  );
};

export default Messages;
