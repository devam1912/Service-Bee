import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    city: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:9876/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-neutral-800 p-6 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold">Create Account</h2>

        {["name","email","password","mobile","address","city"].map((f) => (
          <input
            key={f}
            type={f === "password" ? "password" : "text"}
            name={f}
            placeholder={f}
            value={form[f]}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        ))}

        <button
          disabled={loading}
          className="w-full bg-yellow-400 py-2 rounded font-semibold"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-sm">
          Already have an account? <Link to="/login" className="text-yellow-500">Login</Link>
        </p>
      </form>
    </div>
  );
}
