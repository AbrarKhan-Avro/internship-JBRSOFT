import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";

// You can create more pages later, e.g., JobList, ApplyJob, Dashboard

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dynamic Job Portal</h1>
          <div className="space-x-4">
            <Link to="/register" className="hover:underline">
              Register
            </Link>
            <Link to="/" className="hover:underline">
              Home
            </Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center mt-20">
              <h1 className="text-4xl text-blue-600 font-bold mb-4">
                Welcome to Dynamic Job Portal!
              </h1>
              <p className="text-gray-700">
                Use the navigation above to register or explore jobs.
              </p>
            </div>
          } />
          <Route path="/register" element={<Register />} />
          {/* Future routes:
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id/apply" element={<ApplyJob />} />
          */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
