import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Video, GraduationCap, MapPin, Trophy, Briefcase, ChevronRight, Zap } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState({ videos: [], courses: [], enrollments: [], missions: [], hackathons: [], leaderboard: [] });

    useEffect(() => {
        Promise.all([
            api.get("/videos").then(r => r.data).catch(() => []),
            api.get("/courses").then(r => r.data).catch(() => []),
            api.get("/enrollments/me").then(r => r.data).catch(() => []),
            api.get("/missions").then(r => r.data).catch(() => []),
            api.get("/hackathons").then(r => r.data).catch(() => []),
            api.get("/leaderboard").then(r => r.data).catch(() => []),
        ]).then(([videos, courses, enrollments, missions, hackathons, leaderboard]) => {
            setData({ videos, courses, enrollments, missions, hackathons, leaderboard });
        });
    }, []);

    if (!user) return null;

    const isHR = user.role === "hr";
    const isInstructor = user.role === "instructor";
    const solved = data.missions.filter(m => m.solved).length;

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="mb-8">
                <div className="term text-[10px] uppercase tracking-[0.3em] text-[#00E5FF] mb-2">// session_established</div>
                <h1 className="text-3xl md:text-4xl term font-bold">
                    <span className="text-[#555]">welcome,</span> {user.name}<span className="cursor-blink" />
                </h1>
                <div className="flex flex-wrap gap-3 mt-3 text-xs term">
                    <span className="badge-term">{user.role}</span>
                    <span className="badge-term badge-yellow">rank: {user.rank}</span>
                    <span className="badge-term badge-info">xp: {user.xp}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={MapPin} label="Missions Solved" value={solved} accent="#00E5FF" />
                <StatCard icon={GraduationCap} label="Enrollments" value={data.enrollments.length} accent="#FF2EA6" />
                <StatCard icon={Video} label="Uploads" value={data.videos.filter(v => v.owner_id === user.id).length} accent="#00E5FF" />
                <StatCard icon={Trophy} label="Live Events" value={data.hackathons.length} accent="#FF3B30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <QuickAction />
                    <div className="card-term p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="term text-xs uppercase tracking-widest text-[#00E5FF]">// latest_uploads</div>
                            <Link to="/hub" className="term text-xs text-[#888] hover:text-[#00E5FF]" data-testid="dash-hub-link">view all →</Link>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {data.videos.slice(0, 4).map(v => (
                                <Link key={v.id} to={`/hub/${v.id}`} className="border border-[#333] hover:border-[#00E5FF]/50 transition p-3 flex gap-3 items-center">
                                    <div className="w-16 h-12 bg-[#050505] border border-[#333] flex-shrink-0 overflow-hidden">
                                        {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover opacity-70" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm text-[#E0E0E0] truncate">{v.title}</div>
                                        <div className="term text-[10px] text-[#555] uppercase">{v.owner_name} • {v.video_type}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card-term p-5">
                        <div className="term text-xs uppercase tracking-widest text-[#FF2EA6] mb-4">// leaderboard</div>
                        <div className="space-y-2">
                            {data.leaderboard.slice(0, 6).map((u, i) => (
                                <div key={u.id} className="flex items-center gap-3 text-sm">
                                    <span className="term text-xs text-[#555] w-6">#{i + 1}</span>
                                    <span className="flex-1 truncate text-[#E0E0E0]">{u.name}</span>
                                    <span className="term text-xs text-[#00E5FF]">{u.xp} xp</span>
                                </div>
                            ))}
                            {data.leaderboard.length === 0 && (
                                <div className="text-sm text-[#555] term">// no data yet</div>
                            )}
                        </div>
                    </div>

                    {isHR && (
                        <Link to="/talent" className="card-term p-5 block group" data-testid="dash-talent-cta">
                            <Briefcase className="h-5 w-5 text-[#00E5FF] mb-3" />
                            <div className="text-lg term font-bold mb-1">Browse Talent Pool</div>
                            <div className="text-xs text-[#888] mb-3">Filter verified operatives by skills and mission performance.</div>
                            <div className="term text-xs text-[#00E5FF] flex items-center gap-1">open marketplace <ChevronRight className="h-3.5 w-3.5" /></div>
                        </Link>
                    )}
                    {isInstructor && (
                        <Link to="/academy" className="card-term p-5 block" data-testid="dash-instructor-cta">
                            <GraduationCap className="h-5 w-5 text-[#FF2EA6] mb-3" />
                            <div className="text-lg term font-bold mb-1">Instructor Tools</div>
                            <div className="text-xs text-[#888] mb-3">Publish courses & endorse rising talent.</div>
                            <div className="term text-xs text-[#00E5FF]">manage academy →</div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className="card-term p-4">
            <Icon className="h-5 w-5 mb-2" style={{ color: accent }} />
            <div className="term text-3xl font-bold" style={{ color: accent }}>{value}</div>
            <div className="term text-[10px] uppercase tracking-widest text-[#555] mt-1">{label}</div>
        </div>
    );
}

function QuickAction() {
    return (
        <div className="card-term p-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-20">
                <Zap className="h-32 w-32 text-[#00E5FF]" />
            </div>
            <div className="relative">
                <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-2">// next_op</div>
                <h3 className="text-2xl term font-bold mb-2">Enter HackTheCity</h3>
                <p className="text-[#888] text-sm mb-4 max-w-md">7 missions across 5 districts. Each solve earns XP that impresses recruiters and unlocks ranks.</p>
                <div className="flex gap-3">
                    <Link to="/city" className="btn-primary" data-testid="dash-city-cta">$ enter_city</Link>
                    <Link to="/hackathons" className="btn-ghost" data-testid="dash-hackathon-cta">Live Hackathons</Link>
                </div>
            </div>
        </div>
    );
}
