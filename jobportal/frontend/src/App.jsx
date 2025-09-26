import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import axios from "axios";
import DynamicForm from "./components/DynamicForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ✅ Home Page – fetch list of dynamic pages from backend
function Home() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8001/api/pages/")
      .then((res) => setPages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Dynamic Job Portal
      </h1>
      <ul className="space-y-3 text-center">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              to={`/${p.slug}`}
              className="text-blue-600 underline hover:text-blue-800 text-lg"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ✅ PageForm – renders dynamic form based on slug
function PageForm() {
  const { slug } = useParams();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <DynamicForm slug={slug} />
    </div>
  );
}

// ✅ Main App with Navbar + Footer
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />

        <main className="flex-grow container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:slug" element={<PageForm />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
