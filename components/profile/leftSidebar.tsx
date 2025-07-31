import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";

const ProfileCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="bg-blue-600 p-6 text-center text-white">
        <img
          src="/avatar/avatar.jpeg"
          alt="Alex Smith"
          className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white"
        />
        <h2 className="text-lg font-semibold">Alex Smith</h2>
        <button className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
          Send offer
        </button>
        <p className="mt-2 text-sm text-blue-100">
          Last activity: Today 08:26 PM
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-gray-800 dark:text-white font-semibold mb-2">
            Contact info
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
            <FaEnvelope />
            <span>alexsmith@donboz.ru</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <FaPhoneAlt />
            <span>+20 111 222 34 356</span>
          </div>
        </div>

        <div>
          <h3 className="text-gray-800 font-semibold mb-2">Customer info</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Birthday:</strong> 21 Dec. 2019
            </p>
            <p>
              <strong>City:</strong> London
            </p>
            <p>
              <strong>Province:</strong> Stonehenge
            </p>
            <p>
              <strong>ISP:</strong> BSNL
            </p>
            <p>
              <strong>IP:</strong> 90.222.222.20
            </p>
            <p>
              <strong>Client Id:</strong> 387795881
            </p>
            <p>
              <strong>Gender:</strong> Male
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
