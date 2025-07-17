import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { FiLogOut, FiDownload, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
function Dashboard() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Navigate("/")
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const downloadProfile = () => {
    if (profileData?.profilePic) {
      const link = document.createElement('a');
      link.href = profileData.profilePic;
      link.download = `profile-${user.email.split('@')[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-4">
            {profileData?.profilePic && (
              <button
                onClick={downloadProfile}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <FiDownload className="mr-2" />
                Download Profile
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {user ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col items-center">
                {profileData?.profilePic ? (
                  <img
                    src={profileData.profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                    <FiUser className="text-gray-400 text-5xl" />
                  </div>
                )}
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Welcome, {user.displayName || user.email.split('@')[0]}!
                </h2>
                <p className="mt-2 text-gray-600">{user.email}</p>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg w-full max-w-md">
                  <h3 className="text-lg font-medium text-blue-800">Account Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="text-sm font-medium">
                        {profileData?.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="text-sm font-medium">
                        {new Date(user.metadata.lastSignInTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">No user logged in. Please sign in.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;