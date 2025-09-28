import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">JobPortal</h1>
      <ul className="flex space-x-6">
        <li>
          <a href="/" className="hover:text-yellow-400">Home</a>
        </li>
        <li>
          <a href="/page/Registration" className="hover:text-yellow-400">Register</a>
        </li>
        <li>
          <a href="/page/Login" className="hover:text-yellow-400">Login</a>
        </li>
        <li>
          {/* ✅ Correct single Jobs link */}
          <a href="/jobs" className="hover:text-yellow-400">Jobs</a>
        </li>
        <li>
          <a href="/page/Contact" className="hover:text-yellow-400">Contact</a>
        </li>
      </ul>
    </nav>
  );
}
