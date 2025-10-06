import { useEffect, useState } from "react";

export default function PostJob() {
  const pageSlug = "post-job";
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/pages/${pageSlug}/`);
        const data = await response.json();
        setFormConfig(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching form config:", error);
        setLoading(false);
      }
    };
    fetchFormConfig();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    let fieldValue = value;

    if (type === "checkbox") fieldValue = checked;
    if (type === "file") fieldValue = files[0];

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const formPayload = new FormData();
    for (const key in formData) {
      formPayload.append(key, formData[key]);
    }

    try {
      const response = await fetch(`http://localhost:8001/api/submit/${pageSlug}/`, {
        method: "POST",
        body: formPayload,
      });

      if (response.ok) {
        setMessage("✅ Job posted successfully!");
        setFormData({});
      } else {
        const errData = await response.json();
        setMessage(`❌ Error: ${JSON.stringify(errData.errors || errData)}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("❌ Submission failed. Try again.");
    }
  };

  if (loading) return <div className="p-6">Loading form...</div>;
  if (!formConfig) return <div className="p-6 text-red-500">Form not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{formConfig.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-lg p-6 rounded-2xl">
        {formConfig.fields
          .sort((a, b) => a.order - b.order)
          .map((field) => {
            const { name, label, field_type, placeholder, required, options } = field;

            switch (field_type) {
              case "text":
              case "email":
              case "password":
              case "number":
              case "date":
                return (
                  <div key={name}>
                    <label className="block font-medium mb-1">{label}</label>
                    <input
                      type={field_type}
                      name={name}
                      placeholder={placeholder}
                      required={required}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                );

              case "textarea":
                return (
                  <div key={name}>
                    <label className="block font-medium mb-1">{label}</label>
                    <textarea
                      name={name}
                      placeholder={placeholder}
                      required={required}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded h-24"
                    />
                  </div>
                );

              case "dropdown":
                return (
                  <div key={name}>
                    <label className="block font-medium mb-1">{label}</label>
                    <select
                      name={name}
                      required={required}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      value={formData[name] || ""}
                    >
                      <option value="">-- Select --</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.option_text}
                        </option>
                      ))}
                    </select>
                  </div>
                );

              default:
                return null;
            }
          })}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
}
