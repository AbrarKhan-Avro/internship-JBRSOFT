import DynamicForm from "../components/DynamicForm";

export default function Register() {
  const handleSubmit = (data) => {
    // Map dynamic fields to backend expected format
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      // Any other dynamic fields will be ignored or stored in profile
    };

    fetch("http://localhost:8010/api/users/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((res) => alert("User registered!"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <DynamicForm page="registration" onSubmit={handleSubmit} />
    </div>
  );
}
