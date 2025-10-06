import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to the Job Portal</h1>
      <div className="flex gap-6">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
