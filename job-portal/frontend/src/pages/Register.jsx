import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const pageSlug = "registration";

  useEffect(() => {
    axios
      .get(`${API_BASE}/pages/${pageSlug}/`)
      .then((res) => setPage(res.data))
      .catch((err) => console.error("Error loading page:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert("Username and password are required for registration!");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Submit to backend dynamic form (if any extra fields)
      await axios.post(`${API_BASE}/submit/${pageSlug}/`, formData);

      // 2️⃣ Register user in Django auth
      await axios.post(`${API_BASE}/auth/register/`, {
        username: formData.username,
        email: formData.email || "",
        password: formData.password,
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Registration failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!page)
    return (
      <div className="p-8 text-center text-gray-500">Loading form...</div>
    );

  if (submitted)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-green-100 text-green-800">
        <h1 className="text-2xl font-bold">✅ Registered Successfully!</h1>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-green-700 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">{page.name}</h1>

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            required
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            required
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Dynamic fields from backend */}
        {page.fields.map((field) => (
          <div key={field.id} className="mb-4">
            <label className="block mb-2 font-medium">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {["text", "email", "number", "date"].includes(field.field_type) && (
              <input
                type={field.field_type}
                name={field.name}
                placeholder={field.placeholder || ""}
                required={field.required}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            )}

            {field.field_type === "textarea" && (
              <textarea
                name={field.name}
                placeholder={field.placeholder || ""}
                required={field.required}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            )}

            {field.field_type === "select" && (
              <select
                name={field.name}
                required={field.required}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              >
                <option value="">-- Select --</option>
                {field.options.map((opt) => (
                  <option key={opt.id} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {["radio", "checkbox"].includes(field.field_type) && (
              <div className="flex flex-col space-y-1">
                {field.options.map((opt) => (
                  <label key={opt.id} className="inline-flex items-center space-x-2">
                    <input
                      type={field.field_type}
                      name={field.name}
                      value={opt.value}
                      required={field.required && field.field_type === "radio"}
                      onChange={handleChange}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>
    </div>
  );
}
