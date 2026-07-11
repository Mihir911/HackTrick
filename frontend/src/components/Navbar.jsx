import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Video, GraduationCap, MapPin, Briefcase, Trophy, User, LogOut, Menu, X, PlusCircle } from "lucide-react";
import { useState } from "react";
import { LOGOS } from "@/lib/assets";

const NAV = [
    { path: "/hub", label: "Content Hub", icon: Video, testid: "nav-hub" },
    { path: "/academy", label: "Academy", icon: GraduationCap, testid: "nav-academy" },
    { path: "/city", label: "HackTheCity", icon: MapPin, testid: "nav-city" },
    { path: "/hackathons", label: "Hackathons", icon: Trophy, testid: "nav-hackathons" },
    { path: "/talent", label: "Recruitment", icon: Briefcase, testid: "nav-talent" },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const isAuthed = user && user !== false;

    return (
        <nav className="sticky top-0 z-40 border-b border-[#333] bg-[#0A0A0A]/95 backdrop-blur">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
                    <img src={LOGOS.hacktrick} alt="HackTrick" className="h-9 md:h-10 w-auto object-contain rounded" style={{ filter: "drop-shadow(0 0 8px rgba(230,57,70,0.4))" }} />
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {NAV.map((n) => {
                        const Icon = n.icon;
                        const active = location.pathname.startsWith(n.path);
                        return (
                            <Link
                                key={n.path}
                                to={n.path}
                                data-testid={n.testid}
                                className={`term text-xs uppercase tracking-wider px-3 py-2 flex items-center gap-2 transition-all border border-transparent ${active
                                        ? "text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/5"
                                        : "text-[#888] hover:text-[#E0E0E0] hover:border-[#333]"
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {n.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {isAuthed ? (
                        <>
                            {(user.role === "instructor" || user.role === "admin") && (
                                <Link
                                    to="/studio"
                                    className="hidden sm:flex items-center gap-1.5 term text-xs uppercase text-[#FF2EA6] hover:text-white border border-[#FF2EA6]/40 hover:border-[#FF2EA6] px-3 py-1.5"
                                    data-testid="nav-studio"
                                >
                                    <PlusCircle className="h-3.5 w-3.5" /> Studio
                                </Link>
                            )}
                            <Link
                                to="/profile"
                                className="hidden sm:flex items-center gap-2 term text-xs text-[#E0E0E0] hover:text-[#00E5FF] border border-[#333] px-3 py-1.5"
                                data-testid="nav-profile"
                            >
                                <User className="h-3.5 w-3.5" />
                                {user.name}
                                <span className="badge-term badge-pink ml-1">{user.rank || user.role}</span>
                            </Link>
                            <button
                                onClick={() => { logout(); navigate("/"); }}
                                className="btn-ghost !py-1.5 !text-xs"
                                data-testid="nav-logout"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost !py-1.5 !text-xs" data-testid="nav-login">Login</Link>
                            <Link to="/register" className="btn-primary !py-1.5 !text-xs" data-testid="nav-register">Sign up</Link>
                        </>
                    )}
                    <button className="md:hidden btn-ghost !p-2" onClick={() => setOpen(!open)} data-testid="nav-menu">
                        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            {open && (
                <div className="md:hidden border-t border-[#333] bg-[#0A0A0A]">
                    {NAV.map((n) => {
                        const Icon = n.icon;
                        return (
                            <Link
                                key={n.path}
                                to={n.path}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2 term text-xs uppercase px-4 py-3 text-[#888] hover:text-[#00E5FF] border-b border-[#333]/50"
                                data-testid={`mobile-${n.testid}`}
                            >
                                <Icon className="h-3.5 w-3.5" /> {n.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
