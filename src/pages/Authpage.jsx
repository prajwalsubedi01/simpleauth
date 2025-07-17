import React, { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import { FiLock, FiUserPlus, FiSmile, FiShield, FiAlertCircle, FiUserCheck, FiFolder } from "react-icons/fi";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
       
        <div className="bg-gradient-to-b from-pink-500 to-rose-400 text-white p-8 md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-3">Simple Authentication </h2>
         

          <div className="space-y-5">
            <div className="flex items-start">
              <FiUserCheck className="text-yellow-200 mt-1 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold">Backend Using Firebase</h3>
                <p className="text-rose-100 text-sm">store name, password and profile image</p>
              </div>
            </div>

            <div className="flex items-start">
              <FiFolder className="text-green-200 mt-1 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold">Frontend React+Vite</h3>
                <p className="text-rose-100 text-sm">Has tab login ,Register and User Dashboard after successful Login</p>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white/20 p-4 rounded-lg text-sm italic">
          Simple Auth page Made with React and Firebase.   
            <div className="text-xs mt-2 text-rose-200">– Prajwal Subedi</div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="p-8 md:w-1/2 bg-white">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-3 px-4 font-medium text-center transition-colors ${
                activeTab === "login"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("login")}
            >
              <div className="flex items-center justify-center">
                <FiLock className="mr-2" />
                Login
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 font-medium text-center transition-colors ${
                activeTab === "register"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("register")}
            >
              <div className="flex items-center justify-center">
                <FiUserPlus className="mr-2" />
                Register
              </div>
            </button>
          </div>

          {activeTab === "login" ? (
            <Login />
          ) : (
            <Register switchToLogin={() => setActiveTab("login")} />
          )}

          
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
