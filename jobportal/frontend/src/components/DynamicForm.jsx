import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DynamicForm({ slug }) {
  const [page, setPage] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8001/api/pages/${slug}/`)
      .then(res => {
        setPage(res.data);
      })
      .catch(err => console.error(err));
  }, [slug]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:8001/api/pages/${slug}/submit/`, formData)
      .then(() => setMessage("Form submitted successfully!"))
      .catch(() => setMessage("Submission failed."));
  };

  if (!page) return <p>Loading form...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">{page.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {page.fields.map((field) => {
          const commonProps = {
            name: field.name,
            required: field.required,
            placeholder: field.placeholder,
            value: formData[field.name] || "",
            onChange: (e) => handleChange(field.name, e.target.value),
            className: "w-full p-2 border rounded",
          };

          switch (field.field_type) {
            case "textarea":
              return (
                <div key={field.id}>
                  <label className="block mb-1 font-semibold">{field.label}</label>
                  <textarea {...commonProps} rows="3" />
                </div>
              );
            case "dropdown":
              return (
                <div key={field.id}>
                  <label className="block mb-1 font-semibold">{field.label}</label>
                  <select {...commonProps}>
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt.id} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              );
            case "radio":
              return (
                <div key={field.id}>
                  <p className="mb-1 font-semibold">{field.label}</p>
                  {field.options.map(opt => (
                    <label key={opt.id} className="block">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt.value}
                        checked={formData[field.name] === opt.value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      /> {opt.label}
                    </label>
                  ))}
                </div>
              );
            case "checkbox":
              return (
                <div key={field.id}>
                  <p className="mb-1 font-semibold">{field.label}</p>
                  {field.options.map(opt => (
                    <label key={opt.id} className="block">
                      <input
                        type="checkbox"
                        value={opt.value}
                        checked={(formData[field.name] || []).includes(opt.value)}
                        onChange={(e) => {
                          const current = formData[field.name] || [];
                          if (e.target.checked) {
                            handleChange(field.name, [...current, opt.value]);
                          } else {
                            handleChange(field.name, current.filter(v => v !== opt.value));
                          }
                        }}
                      /> {opt.label}
                    </label>
                  ))}
                </div>
              );
            default:
              return (
                <div key={field.id}>
                  <label className="block mb-1 font-semibold">{field.label}</label>
                  <input type={field.field_type} {...commonProps} />
                </div>
              );
          }
        })}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
