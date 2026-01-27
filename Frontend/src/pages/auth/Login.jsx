import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:9876/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("servicebee_user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-neutral-800 p-6 rounded-lg space-y-4">
        <h2 className="text-2xl font-bold">Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-yellow-400 py-2 rounded font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm">
          No account? <Link to="/signup" className="text-yellow-500">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
