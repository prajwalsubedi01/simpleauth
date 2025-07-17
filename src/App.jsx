import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Authpage";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      {/* <Route path="/login" element={<Login />} /> */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
