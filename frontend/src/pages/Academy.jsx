import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { GraduationCap, Star, Users } from "lucide-react";

export default function Academy() {
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => { load(); }, [filter]);
    const load = async () => {
        const q = filter === "free" ? "?is_free=true" : filter === "paid" ? "?is_free=false" : "";
        const { data } = await api.get(`/courses${q}`);
        setCourses(data);
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                <div>
                    <div className="term text-[10px] uppercase tracking-[0.3em] text-[#FF2EA6] mb-2">// academy</div>
                    <h1 className="text-3xl md:text-4xl term font-bold">Courses & Labs</h1>
                    <p className="text-[#888] text-sm mt-2 max-w-xl">Certified instructors host curricula with real virtual labs. Top performers get endorsed.</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-[#333]">
                {["all", "free", "paid"].map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`term text-xs uppercase tracking-widest px-4 py-2 border-b-2 transition ${filter === t ? "border-[#FF2EA6] text-[#FF2EA6]" : "border-transparent text-[#888] hover:text-[#E0E0E0]"
                            }`}
                        data-testid={`academy-filter-${t}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(c => (
                    <Link key={c.id} to={`/academy/${c.id}`} className="card-term p-5 group block" data-testid={`course-card-${c.id}`}>
                        <div className="flex items-start justify-between mb-3">
                            <GraduationCap className="h-6 w-6 text-[#FF2EA6]" />
                            {c.is_free
                                ? <span className="badge-term badge-yellow">FREEMIUM</span>
                                : <span className="badge-term">${c.price}</span>}
                        </div>
                        <div className="term text-[10px] uppercase tracking-widest text-[#555] mb-1">{c.difficulty}</div>
                        <h3 className="text-lg term font-bold mb-2 text-[#E0E0E0] group-hover:text-[#00E5FF] transition line-clamp-2">{c.title}</h3>
                        <p className="text-[#888] text-xs mb-3 line-clamp-2">{c.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {c.tags?.slice(0, 3).map(t => <span key={t} className="badge-term">{t}</span>)}
                        </div>
                        <div className="flex items-center gap-3 term text-[10px] text-[#555] uppercase pt-3 border-t border-[#333]">
                            <span>by <span className="text-[#00E5FF]">{c.instructor_name}</span></span>
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-[#FF2EA6]" /> {c.rating || "—"}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.enrollment_count}</span>
                        </div>
                    </Link>
                ))}
                {courses.length === 0 && (
                    <div className="col-span-full card-term p-12 text-center term text-[#555]">// no courses matched</div>
                )}
            </div>
        </div>
    );
}
