import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post("/users/login", { email, password });
    login(res.data.token, res.data.user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-card p-6 rounded-xl w-96">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input className="input" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input className="input mt-3" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button className="btn-primary mt-4 w-full">Login</button>
      </form>
    </div>
  );
}
