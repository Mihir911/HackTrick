import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Terminal from "@/components/Terminal";
import City3D from "@/components/City3D";
import { MapPin, Lock, CheckCircle2, Zap, Box, Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import { LOGOS } from "@/lib/assets";

export default function HackTheCity() {
    const { user, refresh } = useAuth();
    const [missions, setMissions] = useState([]);
    const [active, setActive] = useState(null);
    const [view, setView] = useState("3d"); // "3d" | "2d"

    useEffect(() => { load(); }, []);
    const load = async () => {
        const { data } = await api.get("/missions");
        setMissions(data);
    };

    const submitFlag = async (flag) => {
        try {
            const { data } = await api.post("/missions/submit", { mission_id: active.id, flag });
            if (data.correct) {
                toast.success(`+${data.xp_awarded} XP captured`);
                await load();
                await refresh();
                setActive(prev => ({ ...prev, solved: true }));
            } else {
                toast.error(data.message);
            }
            return data;
        } catch {
            toast.error("Submission failed");
            return { correct: false };
        }
    };

    const solvedCount = missions.filter(m => m.solved).length;
    const totalXP = missions.reduce((a, m) => a + (m.solved ? (m.xp || 100) : 0), 0);

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
            {/* HEADER — logo + character showcase */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8 items-stretch">
                <div className="lg:col-span-2 glass p-6 md:p-8 relative overflow-hidden corners">
                    <div className="absolute -right-10 -top-10 orb drift" style={{ background: "radial-gradient(circle, #FF2EA6 0%, transparent 70%)", width: 300, height: 300, opacity: 0.35 }} />
                    <div className="relative flex items-center gap-5 flex-wrap">
                        <img src={LOGOS.hackTheCity} alt="Hack The City" className="h-28 md:h-36 w-auto rounded-lg object-cover border border-[#FF2EA6]/40 float-slow" style={{ filter: "drop-shadow(0 0 24px rgba(255,46,166,0.4))" }} />
                        <div className="flex-1 min-w-[220px]">
                            <div className="term text-[10px] uppercase tracking-[0.4em] text-[#FF2EA6] mb-2 flex items-center gap-2">
                                <span className="live-dot" /> // hack_the_city
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl display neon-text leading-none">HACK THE CITY</h1>
                            <div className="term text-xs text-[#888] mt-3 flex items-center gap-2">
                                powered by
                                <img src={LOGOS.hacktrick} alt="HackTrick" className="inline h-5 rounded" />
                            </div>
                            <div className="mt-4 flex gap-2 flex-wrap">
                                <span className="badge-term">GTA-STYLE</span>
                                <span className="badge-term badge-pink">3D · GAMIFIED</span>
                                <span className="badge-term">AGE 14+</span>
                            </div>
                            <p className="text-[#B0B0B0] text-sm mt-3 max-w-md leading-relaxed">
                                Every district hides a mission. Solve real cyber challenges via a live in-browser terminal.
                                Rank up, get discovered.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative depth">
                    <img src={LOGOS.cityArt} alt="Operative in the city" className="w-full h-full aspect-square object-cover rounded-lg border border-[#FF2EA6]/40 shadow-2xl" style={{ filter: "drop-shadow(0 20px 40px rgba(255,46,166,0.3))" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-lg" />
                    <div className="absolute top-3 left-3 term text-[9px] text-[#00E5FF] uppercase tracking-[0.3em] bg-black/80 px-2 py-1 border border-[#00E5FF]/50 rounded">
                        operative // active
                    </div>
                    <div className="absolute bottom-3 right-3 term text-[9px] text-[#FF2EA6] uppercase tracking-[0.3em] bg-black/80 px-2 py-1 border border-[#FF2EA6]/50 rounded">
                        live_mission
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass-cyan p-4 term">
                    <div className="text-[#666] uppercase tracking-widest text-[10px]">solved</div>
                    <div className="text-[#00E5FF] text-2xl md:text-3xl font-bold glow-cyan mt-1">{solvedCount} / {missions.length}</div>
                </div>
                <div className="glass-pink p-4 term">
                    <div className="text-[#666] uppercase tracking-widest text-[10px]">xp earned</div>
                    <div className="text-[#FF2EA6] text-2xl md:text-3xl font-bold glow-pink mt-1">{totalXP}</div>
                </div>
                <div className="glass p-4 term">
                    <div className="text-[#666] uppercase tracking-widest text-[10px]">rank</div>
                    <div className="text-white text-lg md:text-xl font-bold mt-1">
                        {user?.rank || "Rookie"}
                    </div>
                </div>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setView("3d")}
                    data-testid="view-3d"
                    className={`term text-xs uppercase px-3 py-2 border flex items-center gap-2 transition ${view === "3d" ? "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5" : "border-[#333] text-[#888]"
                        }`}
                >
                    <Box className="h-3.5 w-3.5" /> 3D City
                </button>
                <button
                    onClick={() => setView("2d")}
                    data-testid="view-2d"
                    className={`term text-xs uppercase px-3 py-2 border flex items-center gap-2 transition ${view === "2d" ? "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5" : "border-[#333] text-[#888]"
                        }`}
                >
                    <Grid3x3 className="h-3.5 w-3.5" /> 2D Map
                </button>
                <div className="term text-[10px] text-[#555] uppercase tracking-widest ml-auto">click a mission beacon to hack</div>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    {view === "3d" ? (
                        <div className="card-term relative aspect-video md:aspect-[16/10] overflow-hidden">
                            <City3D missions={missions} activeId={active?.id} onSelect={setActive} />
                            <div className="absolute top-3 left-3 z-10 term text-[10px] text-[#00E5FF] uppercase tracking-widest bg-black/60 px-2 py-1 border border-[#00E5FF]/30">
                                camera auto-orbit • click beacons
                            </div>
                            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 term text-[10px] text-[#888] uppercase tracking-widest bg-black/60 px-2 py-1">
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#E63946" }} /> open</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#FF2EA6" }} /> active</span>
                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#00E5FF" }} /> solved</span>
                            </div>
                        </div>
                    ) : (
                        <Map2D missions={missions} active={active} onSelect={setActive} />
                    )}
                </div>

                {/* Mission panel */}
                <div className="lg:col-span-2">
                    {active ? (
                        <div className="card-term p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="term text-[10px] uppercase tracking-widest text-[#00E5FF] mb-1">// mission #{active.order}</div>
                                    <h3 className="text-xl term font-bold text-white">{active.title}</h3>
                                </div>
                                {active.solved
                                    ? <span className="badge-term flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> SOLVED</span>
                                    : <span className={`badge-term ${active.difficulty === "hard" ? "badge-danger" : active.difficulty === "medium" ? "badge-pink" : ""}`}>{active.difficulty}</span>}
                            </div>
                            <div className="term text-[10px] uppercase text-[#555] mb-3 flex items-center gap-3 flex-wrap">
                                <span>{active.location}</span>
                                <span>•</span>
                                <span>{active.category}</span>
                                <span>•</span>
                                <span className="text-[#FF2EA6] flex items-center gap-1"><Zap className="h-3 w-3" /> {active.xp} XP</span>
                            </div>
                            <p className="text-sm text-[#E0E0E0] mb-4">{active.brief}</p>
                            <Terminal
                                prompt={active.prompt}
                                onSubmit={submitFlag}
                                disabled={active.solved}
                                expectedHint="Read the mission brief carefully. Flag is case-insensitive."
                            />
                        </div>
                    ) : (
                        <div className="card-term p-6 h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <Lock className="h-8 w-8 text-[#555] mx-auto mb-3" />
                                <div className="term text-xs uppercase tracking-widest text-[#555]">select a mission beacon</div>
                                <div className="text-xs text-[#888] mt-2">click any glowing marker in the city</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============ 2D FALLBACK MAP ============
function Map2D({ missions, active, onSelect }) {
    return (
        <div className="card-term relative aspect-[4/3] md:aspect-video overflow-hidden noise scanline">
            <div className="absolute inset-0 grid-bg opacity-50" />
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="45" x2="100" y2="45" stroke="#00E5FF" strokeWidth="0.2" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#00E5FF" strokeWidth="0.2" />
                <line x1="35" y1="0" x2="35" y2="100" stroke="#00E5FF" strokeWidth="0.2" />
                <line x1="70" y1="0" x2="70" y2="100" stroke="#00E5FF" strokeWidth="0.2" />
                <line x1="0" y1="0" x2="100" y2="100" stroke="#FF2EA6" strokeWidth="0.15" strokeDasharray="2,2" />
            </svg>
            <div className="absolute top-3 left-3 term text-[10px] text-[#555] uppercase tracking-widest">Downtown</div>
            <div className="absolute top-3 right-3 term text-[10px] text-[#555] uppercase tracking-widest">Uptown</div>
            <div className="absolute bottom-3 left-3 term text-[10px] text-[#555] uppercase tracking-widest">Sewers</div>
            <div className="absolute bottom-3 right-3 term text-[10px] text-[#555] uppercase tracking-widest">Skyline</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 term text-[9px] text-[#333] uppercase tracking-[0.4em]">◆ hacktrick.city ◆</div>
            {missions.map((m) => {
                const isActive = active?.id === m.id;
                return (
                    <button
                        key={m.id}
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                        onClick={() => onSelect(m)}
                        data-testid={`mission-node-${m.order}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center transition-transform hover:scale-110"
                    >
                        <div className={`h-6 w-6 flex items-center justify-center border-2 relative ${m.solved ? "border-[#00E5FF] bg-[#00E5FF]/20" :
                                isActive ? "border-[#FF2EA6] bg-[#FF2EA6]/20 animate-pulse" :
                                    "border-[#E63946] bg-black"
                            }`}>
                            {m.solved ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00E5FF]" /> : <MapPin className="h-3 w-3 text-[#E63946]" />}
                            {!m.solved && <span className="absolute -inset-2 border border-[#E63946]/30 animate-ping" />}
                        </div>
                        <div className="term text-[9px] text-white bg-black/70 px-1.5 py-0.5 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                            {m.title}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
