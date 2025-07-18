import { useState, useRef } from "react";
import { registerUser } from "../firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { storage } from "../firebase/config";
import { db } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import logo from './../assets/logo.jpg'; // Placeholder image for profile pic
import imageCompression from "browser-image-compression";
 // Placeholder image for profile pic
export default function Register({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");
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
    setPreviewUrl("");
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
        const storageRef = ref(storage, `images/${user.uid}_${profilePic.name}`);
        await uploadBytes(storageRef, compressedFile);
        profilePicURL = await getDownloadURL(storageRef);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        // Continue registration without failing completely
      }
    }

    // 2. Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullName,
      phone,
      photoUrl: profilePicURL || null,  // Use null instead of empty string
      createdAt: new Date(),
    });

    setMessage({
      text: "✅ Registration successful!",
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

        <div className="flex flex-col items-center mb-4">
          <div className="relative group">
            {/* Profile Image with hover overlay */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm relative">
              <img
                src={logo}
                alt="Profile"
                className="w-full h-full object-cover"
              />

              {/* Camera icon overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Upload Button with + icon */}
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
                className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-md"
                title="Upload profile picture"
              >
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </label>
            </div>
          </div>

          {/* Remove Button */}
          {profilePic && (
            <button
              type="button"
              onClick={removeImage}
              className="mt-2 text-xs text-gray-500 hover:text-red-500 flex items-center transition-colors duration-200"
              disabled={loading}
            >
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove
            </button>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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

        {/* Submit button */}
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


      {message.text && (
        <div
          className={`mt-4 p-3 rounded-md text-center ${message.type === "success"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

// Helper: Convert image to Base64
