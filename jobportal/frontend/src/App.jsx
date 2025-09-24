import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import axios from "axios";
import DynamicForm from "./components/DynamicForm";

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
      <h1 className="text-3xl font-bold mb-6">Dynamic Job Portal</h1>
      <ul className="space-y-3">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              to={`/${p.slug}`}
              className="text-blue-600 underline hover:text-blue-800"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PageForm component dynamically loads form based on slug
function PageForm() {
  const { slug } = useParams();
  return <DynamicForm slug={slug} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<PageForm />} />
      </Routes>
    </BrowserRouter>
  );
}
