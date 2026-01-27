import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const res = await axios.post("http://localhost:9876/api/users/login", {
        email,
        password,
      });

      login({
        user: res.data.user,
        token: res.data.token,
      });

      navigate("/global");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-yellow-400 py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
