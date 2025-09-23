import React, { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username:"", password:"" });
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/token/", form);
      login(res.data.access);
      setErr(null);
    } catch (e) {
      setErr("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {err && <div className="text-red-500 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} placeholder="Username" className="w-full border p-2" />
        <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="w-full border p-2" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  );
}
