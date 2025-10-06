import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-lg">Job Portal</h1>
      <div className="flex gap-4">
        <NavLink to="/dashboard/profile" className="hover:underline">Profile</NavLink>
        <NavLink to="/dashboard/jobs" className="hover:underline">Jobs</NavLink>
        <NavLink to="/dashboard/post-job" className="hover:underline">Post Job</NavLink>
        <NavLink to="/dashboard/about" className="hover:underline">About</NavLink>
        <button onClick={handleLogout} className="ml-4 bg-red-500 px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </nav>
  );
}
