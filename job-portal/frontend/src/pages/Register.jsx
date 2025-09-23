import React, { useState } from "react";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ username:"", email:"", password:"", password2:"" });
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register/", form);
      setMsg("Registration successful. Please login.");
    } catch (e) {
      setMsg("Registration failed: " + JSON.stringify(e.response?.data || e.message));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {msg && <div className="mb-2">{msg}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} placeholder="Username" className="w-full border p-2" />
        <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full border p-2" />
        <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="w-full border p-2" />
        <input value={form.password2} onChange={e=>setForm({...form, password2:e.target.value})} placeholder="Confirm Password" type="password" className="w-full border p-2" />
        <button className="bg-green-500 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}
