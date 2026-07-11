import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatError } from "@/lib/api";
import { toast } from "sonner";
import { Terminal } from "lucide-react";

const ROLES = [
    { key: "student", label: "Student", desc: "learn, hack, climb ranks" },
    { key: "researcher", label: "Researcher", desc: "publish deep-dive content" },
    { key: "instructor", label: "Instructor", desc: "host courses + endorse talent" },
    { key: "hr", label: "HR / Recruiter", desc: "hire from verified talent pool" },
];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setBusy(true);
        try {
            const user = await register(form);
            toast.success(`Session initiated: ${user.name}`);
            navigate("/dashboard");
        } catch (e) {
            const msg = formatError(e.response?.data) || e.message;
            setErr(msg);
            toast.error(msg);
        } finally { setBusy(false); }
    };

    return (
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl">
                <div className="card-term p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Terminal className="h-5 w-5 text-[#00E5FF]" />
                        <span className="term text-xs uppercase tracking-widest text-[#00E5FF]">// auth.register</span>
                    </div>
                    <h1 className="text-3xl term font-bold mb-2">$ ./create_operative</h1>
                    <p className="text-[#888] text-sm mb-6">Pick a role. All are welcome, age 14+.</p>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">alias / name</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-term" placeholder="operative_name" data-testid="register-name-input" />
                            </div>
                            <div>
                                <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">email</label>
                                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-term" placeholder="op@hacktrick.io" data-testid="register-email-input" />
                            </div>
                        </div>
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">password (min 6)</label>
                            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input-term" placeholder="••••••••••" data-testid="register-password-input" />
                        </div>
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-2 block">select role</label>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {ROLES.map((r, i) => (
                                    <button
                                        key={r.key}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: r.key })}
                                        data-testid={`register-role-${r.key}`}
                                        className={`text-left p-3 border transition ${form.role === r.key
                                                ? "border-[#00E5FF] bg-[#00E5FF]/5"
                                                : "border-[#333] hover:border-[#555]"
                                            }`}
                                    >
                                        <div className="term text-xs">
                                            <span className={form.role === r.key ? "text-[#00E5FF]" : "text-[#888]"}>[{i + 1}]</span>{" "}
                                            <span className="text-[#E0E0E0] font-bold">{r.label}</span>
                                        </div>
                                        <div className="text-[11px] text-[#555] mt-1">{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {err && <div className="term text-xs text-[#FF3B30]" data-testid="register-error">[!] {err}</div>}
                        <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="register-submit-button">
                            {busy ? "provisioning..." : "$ ./init_session"}
                        </button>
                    </form>
                    <div className="mt-6 pt-6 border-t border-[#333] term text-xs text-[#888]">
                        Already registered? <Link to="/login" className="text-[#00E5FF] hover:underline" data-testid="register-login-link">login()</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
