import { useState, useRef } from "react";
import { registerUser } from "../firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { storage } from "../firebase/config";
import { db } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { FiCamera, FiX, FiUser } from "react-icons/fi";

export default function Register({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfilePic(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      // 1. Register the user
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;

      let profilePicURL = null;
      if (profilePic) {
        try {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(profilePic, options);
          const storageRef = ref(storage, `profilePics/${user.uid}`);
          await uploadBytes(storageRef, compressedFile);
          profilePicURL = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }

      // 2. Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName,
        phone,
        photoUrl: profilePicURL,
        createdAt: new Date(),
      });

      setMessage({
        text: "✅ Registration successful! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => switchToLogin(), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        text: `❌ ${error.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Create Account
      </h2>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm relative bg-gray-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiUser className="w-10 h-10" />
                </div>
              )}

              {!previewUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <FiCamera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            <div className="absolute -bottom-1 -right-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
                disabled={loading}
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors duration-200 shadow-md ${
                  previewUrl ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={previewUrl ? "Change photo" : "Upload photo"}
              >
                <FiCamera className="w-4 h-4 text-white" />
              </label>
            </div>
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={removeImage}
              className="mt-2 text-xs text-gray-500 hover:text-red-500 flex items-center transition-colors duration-200"
              disabled={loading}
            >
              <FiX className="w-3 h-3 mr-1" />
              Remove
            </button>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Your full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="98XXXXXXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Register"
          )}
        </button>
      </form>

      {/* Status Message */}
      {message.text && (
        <div
          className={`mt-4 p-3 rounded-md text-center ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Login Link */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-blue-600 hover:text-blue-800 font-medium"
          disabled={loading}
        >
          Log in
        </button>
      </div>
    </div>
  );
}