import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ApplyJob() {
  const location = useLocation();
  const job = location.state?.job?.data || {};
  const pageSlug = "apply-job";

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

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const formPayload = new FormData();
    for (const key in formData) {
      formPayload.append(key, formData[key]);
    }

    // Include job info
    formPayload.append("job_title", job.job_title || "Unknown");
    formPayload.append("company_name", job.company_name || "Unknown");

    try {
      const response = await fetch(`http://localhost:8001/api/submit/${pageSlug}/`, {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Application submitted successfully!");
        setFormData({});
      } else {
        setMessage(`❌ Error: ${JSON.stringify(data.errors || data)}`);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setMessage("❌ Submission failed. Try again.");
    }
  };

  if (loading) return <div className="p-6">Loading form...</div>;
  if (!formConfig) return <div className="p-6 text-red-500">Form not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">{formConfig.name}</h2>
      <p className="mb-4 text-gray-600">
        Applying for <strong>{job.job_title}</strong> at <strong>{job.company_name}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-lg p-6 rounded-2xl">
        {formConfig.fields
          .sort((a, b) => a.order - b.order)
          .map((field) => {
            const { name, label, field_type, placeholder, required, options } = field;

            if (["text", "email", "password", "number", "date"].includes(field_type))
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

            if (field_type === "textarea")
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

            return null;
          })}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Application
        </button>
      </form>

      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
}
