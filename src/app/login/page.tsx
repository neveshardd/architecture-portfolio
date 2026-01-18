"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/login", { email, password });
      router.push("/admin");
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="bg-white p-8 border border-gray-100 shadow-2xl w-full max-w-sm flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="text-center">
            <h1 className="text-2xl font-light uppercase tracking-widest mb-2">Admin Access</h1>
            <p className="text-xs text-gray-400 font-light uppercase tracking-wide">Enter your credentials</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 text-center border border-red-100 rounded">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors"
                />
            </div>
            
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Password</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border border-gray-200 p-3 text-sm font-light focus:outline-none focus:border-black transition-colors"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-black text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors shadow-lg mt-4 disabled:opacity-50"
            >
                {isLoading ? "Authenticating..." : "Enter Dashboard"}
            </button>
        </form>
        
        <div className="text-center pt-2 border-t border-gray-100">
            <Link href="/" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                ← Back to Website
            </Link>
        </div>
      </div>
    </div>
  );
}
