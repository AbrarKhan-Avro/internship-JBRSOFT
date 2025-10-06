export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
}
