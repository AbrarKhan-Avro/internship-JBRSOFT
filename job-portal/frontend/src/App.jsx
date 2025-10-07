import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Dashboard/Profile";
import Jobs from "./pages/Dashboard/Jobs";
import PostJob from "./pages/Dashboard/PostJob";
import About from "./pages/Dashboard/About";
import ApplyJob from "./pages/ApplyJob"; // ✅ NEW PAGE
import Navbar from "./components/Navbar";

function App() {
  const user = localStorage.getItem("user");

  return (
    <Routes>
      {/* 🌐 Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/apply" element={<ApplyJob />} /> {/* ✅ Added ApplyJob route */}

      {/* 🔒 Authenticated routes */}
      {user ? (
        <Route
          path="/dashboard/*"
          element={
            <div>
              <Navbar />
              <Routes>
                <Route path="profile" element={<Profile />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="post-job" element={<PostJob />} />
                <Route path="about" element={<About />} />
                <Route path="*" element={<Navigate to="profile" />} />
              </Routes>
            </div>
          }
        />
      ) : (
        <Route path="/dashboard/*" element={<Navigate to="/login" />} />
      )}

      {/* 🚦 Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
