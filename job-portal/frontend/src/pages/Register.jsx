import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
  const [page, setPage] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${API_BASE}/submit/${pageSlug}/`, formData)
      .then(() => setSubmitted(true))
      .catch((err) => {
        console.error(err);
        alert("Submission failed. Check console for details.");
      });
  };

  if (!page)
    return (
      <div className="p-8 text-center text-gray-500">Loading form...</div>
    );

  if (submitted)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-green-100 text-green-800">
        <h1 className="text-2xl font-bold">✅ Form submitted successfully!</h1>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 px-4 py-2 bg-green-700 text-white rounded"
        >
          Submit Another
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

        {page.fields.map((field) => (
          <div key={field.id} className="mb-4">
            <label className="block mb-2 font-medium">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {/* Render field based on its type */}
            {["text", "email", "password", "number", "date"].includes(
              field.field_type
            ) && (
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
                  <label
                    key={opt.id}
                    className="inline-flex items-center space-x-2"
                  >
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
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
