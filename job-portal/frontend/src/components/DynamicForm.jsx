import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import api from "../api";
import { AuthContext } from "../auth/AuthProvider";

/**
 * DynamicForm
 * Props:
 *  - slug: page slug (string)
 *
 * Notes:
 *  - Expects API GET /pages/<slug>/ to return page with `fields` array
 *  - Expects page.fields[].validation to be a JSON object with optional keys:
 *      min_length, max_length, min, max, pattern (string - regex)
 */
export default function DynamicForm({ slug }) {
  const { user } = useContext(AuthContext || {}); // AuthContext may be undefined in some setups
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitResult, setSubmitResult] = useState(null);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filePreviews, setFilePreviews] = useState({}); // { fieldName: [filename1, ...] }

  const { register, handleSubmit, formState: { errors }, setValue, getValues, reset } = useForm();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/pages/${slug}/`)
      .then(res => {
        if (cancelled) return;
        setPage(res.data);
        setLoading(false);
        // set default values from fields default_value
        if (res.data && Array.isArray(res.data.fields)) {
          const defaults = {};
          for (const f of res.data.fields) {
            if (f.default_value !== null && f.default_value !== undefined && f.default_value !== "") {
              // For checkboxes (multiple) we won't prefill here unless it's a comma-separated list
              if (f.field_type === "checkboxes") {
                try {
                  // if default is JSON array string
                  const parsed = JSON.parse(f.default_value);
                  if (Array.isArray(parsed)) defaults[f.name] = parsed;
                } catch {
                  // fallback: comma separated
                  defaults[f.name] = f.default_value.split(",").map(s => s.trim());
                }
              } else if (f.field_type === "checkbox") {
                // boolean
                defaults[f.name] = (f.default_value === "true" || f.default_value === true);
              } else {
                defaults[f.name] = f.default_value;
              }
            }
          }
          reset(defaults);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug, reset]);

  // helper: build validation rules for react-hook-form from field.validation
  const buildValidation = (field) => {
    const rules = {};
    if (field.required) rules.required = `${field.label || field.name} is required`;
    const v = field.validation || {};
    if (v.min_length != null) rules.minLength = { value: v.min_length, message: `Minimum length is ${v.min_length}` };
    if (v.max_length != null) rules.maxLength = { value: v.max_length, message: `Maximum length is ${v.max_length}` };
    if (v.min != null) rules.min = { value: v.min, message: `Minimum value is ${v.min}` };
    if (v.max != null) rules.max = { value: v.max, message: `Maximum value is ${v.max}` };
    if (v.pattern) {
      try {
        const re = new RegExp(v.pattern);
        rules.pattern = { value: re, message: `Invalid format` };
      } catch (e) {
        // invalid pattern stored — ignore it
      }
    }
    return rules;
  };

  // helper: get server-side error for a field (if available)
  const serverErrorFor = (fieldName) => {
    if (!serverFieldErrors) return null;
    // serverFieldErrors may be an object like { field_name: ["err1", "err2"], ... }
    const e = serverFieldErrors[fieldName];
    return e ? (Array.isArray(e) ? e.join("; ") : String(e)) : null;
  };

  const onSubmit = async (data) => {
    if (!page) return;
    setSubmitting(true);
    setSubmitResult(null);
    setServerFieldErrors({});

    try {
      const formData = new FormData();

      for (let field of page.fields) {
        const name = field.name;

        // files
        if (field.field_type === "file") {
          // react-hook-form stores FileList for file inputs
          const fileList = data[name];
          if (fileList && fileList.length > 0) {
            // support multiple files? our backend treats each field name occurrence as a file list
            for (let i = 0; i < fileList.length; i++) {
              formData.append(name, fileList[i]);
            }
          }
          continue;
        }

        // multiple checkboxes: react-hook-form will return array for same-name checkboxes
        if (field.field_type === "checkboxes") {
          const val = data[name];
          if (Array.isArray(val)) {
            for (const v of val) formData.append(name, v);
          } else if (val !== undefined && val !== null && val !== "") {
            // single value
            formData.append(name, val);
          }
          continue;
        }

        // single checkbox -> boolean (true/false) -> convert to "true"/"false" or "1"/"0"
        if (field.field_type === "checkbox") {
          const val = data[name];
          // append boolean as string 'true'/'false'
          formData.append(name, !!val);
          continue;
        }

        // normal fields (text, textarea, select, radio, number, email, date, hidden, password)
        const val = data[name];
        if (val !== undefined && val !== null) {
          formData.append(name, val);
        } else {
          // append empty string for missing fields to keep backend consistent
          formData.append(name, "");
        }
      }

      const res = await api.post(`/pages/${slug}/submit/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitResult({ success: true, data: res.data });
      setServerFieldErrors({});
      // optionally reset the form (except keep defaults)
      // reset();
    } catch (err) {
      // Try to extract useful error info
      const resp = err?.response?.data;
      let userMessage = "Submission failed";
      let fieldErrors = {};

      if (resp) {
        if (resp.detail) userMessage = resp.detail;
        if (resp.errors) {
          // our backend returns {"detail":"Validation error","errors": {...}}
          fieldErrors = resp.errors;
        } else if (typeof resp === "object") {
          // maybe resp is a dict of field errors directly
          fieldErrors = resp;
        } else if (resp.message) {
          userMessage = resp.message;
        }
      } else {
        userMessage = err.message;
      }

      setSubmitResult({ success: false, message: userMessage });
      setServerFieldErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map(f => f.name);
    setFilePreviews(prev => ({ ...prev, [fieldName]: names }));
    // update RHF value so onSubmit receives the FileList
    setValue(fieldName, files);
  };

  // UI states
  if (loading) return <div className="p-4">Loading...</div>;
  if (!page) return <div className="p-4">Page not found.</div>;

  // If page requires login and no user is present, show prompt
  if (page.requires_login && !user) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-yellow-50 rounded">
        <h2 className="text-xl font-semibold mb-2">{page.title}</h2>
        <p className="mb-4">{page.description}</p>
        <div className="text-sm mb-2">You must be logged in to submit this form.</div>
        <a href="/login" className="text-blue-600 underline">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{page.title}</h1>
      {page.description && <p className="mb-4 text-gray-700">{page.description}</p>}

      {submitResult && submitResult.success && (
        <div className="bg-green-100 border border-green-300 p-3 mb-4 rounded">
          <strong>Success!</strong>
          <div className="text-sm mt-1">Your form was submitted.</div>
        </div>
      )}

      {submitResult && !submitResult.success && (
        <div className="bg-red-100 border border-red-300 p-3 mb-4 rounded">
          <strong>Error:</strong> <span className="ml-2">{submitResult.message || "There were errors with your submission."}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {Array.isArray(page.fields) && page.fields.length === 0 && <div className="text-gray-500">No fields defined for this page.</div>}

        {page.fields.map(field => {
          const rules = buildValidation(field);
          const fieldErr = errors[field.name];
          const srvErr = serverErrorFor(field.name);

          // common props for default inputs
          const commonRegister = register(field.name, rules);

          return (
            <div key={field.id} className="mb-3">
              <label className="block font-medium mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* help text */}
              {field.help_text && <div className="text-xs text-gray-500 mb-1">{field.help_text}</div>}

              {/* Render by field type */}
              {(["text", "email", "password", "number", "date", "hidden"].includes(field.field_type)) && (
                <input
                  type={field.field_type === "hidden" ? "hidden" : field.field_type}
                  placeholder={field.placeholder || ""}
                  className={`${field.field_type !== "hidden" ? "w-full border rounded p-2" : ""}`}
                  {...commonRegister}
                />
              )}

              {field.field_type === "textarea" && (
                <textarea placeholder={field.placeholder || ""} className="w-full border rounded p-2" {...commonRegister} />
              )}

              {field.field_type === "select" && (
                <select className="w-full border rounded p-2" {...commonRegister}>
                  <option value="">{field.placeholder || "Select..."}</option>
                  {Array.isArray(field.options) && field.options.map(opt => (
                    <option key={opt.id} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {field.field_type === "radio" && Array.isArray(field.options) && (
                <div className="flex flex-wrap gap-3">
                  {field.options.map(opt => (
                    <label key={opt.id} className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        value={opt.value}
                        {...register(field.name, rules)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.field_type === "checkboxes" && Array.isArray(field.options) && (
                <div className="flex flex-wrap gap-3">
                  {field.options.map(opt => (
                    <label key={opt.id} className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={opt.value}
                        {...register(field.name)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.field_type === "checkbox" && (
                <label className="inline-flex items-center space-x-2">
                  <input type="checkbox" {...register(field.name)} />
                  <span className="text-sm">{field.placeholder || ""}</span>
                </label>
              )}

              {field.field_type === "file" && (
                <div>
                  <input
                    type="file"
                    // allow single file; if you want multiple: add multiple attribute and adapt backend
                    onChange={(e) => handleFileChange(e, field.name)}
                    className="w-full"
                    // register file input so react-hook-form can retrieve FileList on submit
                    {...register(field.name)}
                  />
                  {filePreviews[field.name] && filePreviews[field.name].length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      Selected: {filePreviews[field.name].join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* Errors: client & server */}
              {(fieldErr || srvErr) && (
                <div className="text-sm text-red-600 mt-1">
                  {fieldErr ? fieldErr.message : null}
                  {fieldErr && srvErr ? " — " : null}
                  {(!fieldErr && srvErr) ? srvErr : null}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : (page.submit_label || "Submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
