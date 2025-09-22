import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api";

export default function DynamicForm({ slug }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitResult, setSubmitResult] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    api.get(`/pages/${slug}/`)
      .then(res => {
        setPage(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      for (let field of page.fields) {
        if (field.field_type === "file") {
          if (data[field.name] && data[field.name][0]) {
            formData.append(field.name, data[field.name][0]);
          }
        } else if (field.field_type === "checkboxes") {
          (data[field.name] || []).forEach(v => formData.append(field.name, v));
        } else {
          formData.append(field.name, data[field.name]);
        }
      }

      const res = await api.post(`/pages/${slug}/submit/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitResult({ success: true, data: res.data });
    } catch (err) {
      setSubmitResult({ success: false, errors: err.response?.data?.errors || err.message });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found.</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{page.title}</h1>
      <p className="mb-4">{page.description}</p>
      {submitResult && submitResult.success && <div className="bg-green-200 p-2 mb-4">Form submitted successfully!</div>}
      {submitResult && !submitResult.success && <div className="bg-red-200 p-2 mb-4">Errors: {JSON.stringify(submitResult.errors)}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {page.fields.map(field => {
          const commonProps = { ...register(field.name, { required: field.required }) };
          return (
            <div key={field.id}>
              <label className="block font-medium mb-1">{field.label}{field.required && "*"}</label>
              {field.field_type === "text" || field.field_type === "email" || field.field_type === "password" || field.field_type === "number" || field.field_type === "date" ? (
                <input type={field.field_type} placeholder={field.placeholder} className="w-full border p-2" {...commonProps} />
              ) : field.field_type === "textarea" ? (
                <textarea placeholder={field.placeholder} className="w-full border p-2" {...commonProps} />
              ) : field.field_type === "select" ? (
                <select className="w-full border p-2" {...commonProps}>
                  <option value="">Select...</option>
                  {field.options.map(opt => <option key={opt.id} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : field.field_type === "radio" ? (
                field.options.map(opt => (
                  <label key={opt.id} className="mr-4">
                    <input type="radio" value={opt.value} {...register(field.name, { required: field.required })} /> {opt.label}
                  </label>
                ))
              ) : field.field_type === "checkboxes" ? (
                field.options.map(opt => (
                  <label key={opt.id} className="mr-4">
                    <input type="checkbox" value={opt.value} {...register(field.name)} /> {opt.label}
                  </label>
                ))
              ) : field.field_type === "checkbox" ? (
                <input type="checkbox" {...register(field.name)} />
              ) : field.field_type === "file" ? (
                <input type="file" {...register(field.name)} />
              ) : null}
              {errors[field.name] && <p className="text-red-500">{field.label} is required</p>}
            </div>
          );
        })}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}
