import React, { useEffect, useState } from "react";

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(
          "http://localhost:8001/api/pages/job-post/submissions/"
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch jobs: ${res.status}`);
        }

        const subs = await res.json();
        setJobs(subs);
      } catch (err) {
        console.error(err);
        setError("Unable to load job postings.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return <p>Loading jobs…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {jobs.length === 0 && <p>No job postings yet.</p>}
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border rounded p-4 shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2">
              {job.data.job_title || "Untitled"}
            </h3>
            {job.data.company && (
              <p className="text-gray-600 mb-1">{job.data.company}</p>
            )}
            {job.data.description && (
              <p className="mb-3">{job.data.description}</p>
            )}
            {job.data.apply_link && (
              <a
                href={job.data.apply_link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Apply Here
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
