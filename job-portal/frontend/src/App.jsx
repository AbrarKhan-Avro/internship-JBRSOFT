import { Routes, Route, Link } from "react-router-dom";
import DynamicForm from "./components/DynamicForm";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navbar */}
      <nav className="mb-6 flex space-x-4">
        <Link to="/" className="text-blue-600 font-semibold hover:underline">Home</Link>
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        <Link to="/job-apply" className="text-blue-600 font-semibold hover:underline">Job Apply</Link>
      </nav>

      {/* Routes */}
      <Routes>
        {/* Home page */}
        <Route
          path="/"
          element={
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Welcome to Job Portal</h1>
              <p className="text-gray-700">
                Use the navbar above to register, login, or apply for jobs.
              </p>
            </div>
          }
        />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Dynamic job apply form */}
        <Route path="/job-apply" element={<DynamicForm slug="job-apply" />} />
      </Routes>
    </div>
  );
}

export default App;
