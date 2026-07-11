import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatError } from "@/lib/api";
import { toast } from "sonner";
import { Terminal } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setBusy(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}`);
            navigate("/dashboard");
        } catch (e) {
            const msg = formatError(e.response?.data) || e.message;
            setErr(msg);
            toast.error(msg);
        } finally { setBusy(false); }
    };

    return (
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="card-term p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Terminal className="h-5 w-5 text-[#00E5FF]" />
                        <span className="term text-xs uppercase tracking-widest text-[#00E5FF]">// auth.login</span>
                    </div>
                    <h1 className="text-3xl term font-bold mb-2">$ login</h1>
                    <p className="text-[#888] text-sm mb-6">Enter credentials to establish session.</p>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input-term"
                                placeholder="operative@hacktrick.io"
                                data-testid="login-email-input"
                            />
                        </div>
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">password</label>
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input-term"
                                placeholder="••••••••••"
                                data-testid="login-password-input"
                            />
                        </div>
                        {err && <div className="term text-xs text-[#FF3B30]" data-testid="login-error">[!] {err}</div>}
                        <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="login-submit-button">
                            {busy ? "authenticating..." : "$ execute"}
                        </button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-[#333] term text-xs text-[#888]">
                        No account? <Link to="/register" className="text-[#00E5FF] hover:underline" data-testid="login-register-link">register()</Link>
                    </div>
                    <div className="mt-4 p-3 border border-[#333]/60 bg-[#0A0A0A] term text-[10px] text-[#555] leading-relaxed">
                        demo: neo@hacktrick.io / Password@1
                    </div>
                </div>
            </div>
        </div>
    );
}
