import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DynamicForm({ slug }) {
  const [page, setPage] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8001/api/pages/${slug}/`)
      .then((res) => {
        setPage(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:8001/api/pages/${slug}/submit/`, formData)
      .then(() => setMessage("✅ Form submitted successfully!"))
      .catch(() => setMessage("❌ Submission failed. Please try again."));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600 animate-pulse">Loading form...</p>
      </div>
    );
  }

  if (!page) {
    return <p className="text-center text-red-500">Page not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {page.name}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {page.fields.map((field) => {
          const commonProps = {
            name: field.name,
            required: field.required,
            placeholder: field.placeholder,
            value: formData[field.name] || "",
            onChange: (e) => handleChange(field.name, e.target.value),
            className:
              "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
          };

          switch (field.field_type) {
            case "textarea":
              return (
                <div key={field.id} className="flex flex-col">
                  <label className="font-semibold mb-2">{field.label}</label>
                  <textarea {...commonProps} rows="4" />
                </div>
              );

            case "dropdown":
              return (
                <div key={field.id} className="flex flex-col">
                  <label className="font-semibold mb-2">{field.label}</label>
                  <select {...commonProps}>
                    <option value="">Select...</option>
                    {field.options.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );

            case "radio":
              return (
                <div key={field.id}>
                  <p className="font-semibold mb-2">{field.label}</p>
                  <div className="space-y-2">
                    {field.options.map((opt) => (
                      <label key={opt.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={field.name}
                          value={opt.value}
                          checked={formData[field.name] === opt.value}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );

            case "checkbox":
              return (
                <div key={field.id}>
                  <p className="font-semibold mb-2">{field.label}</p>
                  <div className="space-y-2">
                    {field.options.map((opt) => (
                      <label key={opt.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={(formData[field.name] || []).includes(
                            opt.value
                          )}
                          onChange={(e) => {
                            const current = formData[field.name] || [];
                            if (e.target.checked) {
                              handleChange(field.name, [...current, opt.value]);
                            } else {
                              handleChange(
                                field.name,
                                current.filter((v) => v !== opt.value)
                              );
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );

            default:
              return (
                <div key={field.id} className="flex flex-col">
                  <label className="font-semibold mb-2">{field.label}</label>
                  <input type={field.field_type} {...commonProps} />
                </div>
              );
          }
        })}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md shadow-md transition duration-200"
        >
          Submit
        </button>
      </form>

      {message && (
        <p
          className={`mt-6 text-center font-semibold ${
            message.includes("✅") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
