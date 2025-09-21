import { useEffect, useState } from "react";

export default function DynamicForm({ page, onSubmit }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch dynamic fields for the page
    fetch(`http://localhost:8010/api/dynamic-fields/?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setFields(data);
        // initialize formData with empty values
        const initialData = {};
        data.forEach((f) => (initialData[f.key] = ""));
        setFormData(initialData);
      });
  }, [page]);

  const handleChange = (e, key) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block font-semibold mb-1">{field.name}</label>
          {field.field_type === "textarea" ? (
            <textarea
              className="w-full border p-2 rounded"
              value={formData[field.key]}
              onChange={(e) => handleChange(e, field.key)}
              required={field.required}
            />
          ) : field.field_type === "select" ? (
            <select
              className="w-full border p-2 rounded"
              value={formData[field.key]}
              onChange={(e) => handleChange(e, field.key)}
              required={field.required}
            >
              <option value="">Select</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.field_type}
              className="w-full border p-2 rounded"
              value={formData[field.key]}
              onChange={(e) => handleChange(e, field.key)}
              required={field.required}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
