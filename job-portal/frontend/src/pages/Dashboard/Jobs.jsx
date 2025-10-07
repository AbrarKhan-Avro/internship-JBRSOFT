import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/jobs/");
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to fetch jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-600 text-center">Loading jobs...</div>;

  if (error)
    return <div className="p-6 text-red-600 text-center">{error}</div>;

  if (!jobs.length)
    return (
      <div className="p-6 text-gray-600 text-center">
        No jobs available yet. Try posting one!
      </div>
    );

  const handleApply = (job) => {
    // Navigate to the apply page and pass job data
    navigate("/apply", { state: { job } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Jobs</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => {
          const data = job.data || {};
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition bg-white p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-700">
                  {data.job_title || "Untitled Job"}
                </h3>
                <p className="text-gray-700 mb-1">
                  <strong>Company:</strong> {data.company_name || "N/A"}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Location:</strong> {data.location || "N/A"}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Salary:</strong> {data.salary || "N/A"}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Type:</strong> {data.job_type || "N/A"}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Deadline:</strong> {data.deadline || "N/A"}
                </p>
                <p className="text-gray-600 mt-2">
                  {data.description || "No description provided."}
                </p>
              </div>

              <button
                onClick={() => handleApply(job)}
                className="mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Apply
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
