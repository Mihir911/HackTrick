import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Video, GraduationCap, MapPin, Briefcase, Trophy, ChevronRight, Zap, Shield,
    Users, Cpu, Radio, Award, Terminal, Rocket, ArrowRight, CheckCircle2
} from "lucide-react";
import api from "@/lib/api";
import { LOGOS } from "@/lib/assets";

function TypingLine({ text, speed = 45, delay = 0 }) {
    const [display, setDisplay] = useState("");
    useEffect(() => {
        let i = 0;
        const t = setTimeout(() => {
            const iv = setInterval(() => {
                i++;
                setDisplay(text.slice(0, i));
                if (i >= text.length) clearInterval(iv);
            }, speed);
        }, delay);
        return () => clearTimeout(t);
    }, [text, speed, delay]);
    return <span>{display}</span>;
}

export default function Landing() {
    const [stats, setStats] = useState({ users: 0, videos: 0, courses: 0, missions: 0, hackathons: 0 });
    useEffect(() => { api.get("/stats").then(r => setStats(r.data)).catch(() => { }); }, []);

    return (
        <div>
            {/* ========== HERO ========== */}
            <section className="relative overflow-hidden border-b border-[#1a1a1a]">
                <div className="bg-orbs">
                    <div className="orb drift" style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)", width: 500, height: 500, top: -100, left: -100 }} />
                    <div className="orb drift-slow" style={{ background: "radial-gradient(circle, #FF2EA6 0%, transparent 70%)", width: 550, height: 550, bottom: -150, right: -100 }} />
                    <div className="orb drift" style={{ background: "radial-gradient(circle, #E63946 0%, transparent 70%)", width: 320, height: 320, top: "40%", left: "50%", opacity: 0.25 }} />
                </div>
                <div className="absolute inset-0 grid-bg opacity-30" />

                <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-14 md:py-20 lg:py-24 grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                    <div className="lg:col-span-7">
                        <div className="term text-[10px] uppercase tracking-[0.4em] text-[#00E5FF] mb-5 flex items-center gap-2">
                            <span className="live-dot" /> live • uplink established • 2026
                        </div>

                        <div className="mb-5 flex items-center gap-4">
                            <img src={LOGOS.hacktrick} alt="HACKTRICK" className="h-16 md:h-20 w-auto object-contain rounded" style={{ filter: "drop-shadow(0 0 24px rgba(230,57,70,0.35))" }} />
                            <div className="hidden sm:block">
                                <div className="term text-[10px] uppercase tracking-widest text-[#666]">est. 2026</div>
                                <div className="term text-xs text-[#00E5FF]">hacktrick.in</div>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 term text-white leading-[1.05]">
                            <TypingLine text="> learn.hack." speed={55} />
                            <span className="neon-text glitch"><TypingLine text="get_hired();" speed={55} delay={700} /></span>
                            <span className="cursor-blink"></span>
                        </h1>

                        <p className="text-[#B0B0B0] text-base md:text-lg max-w-2xl leading-relaxed mb-8">
                            The cybersecurity ecosystem where students, researchers, and industry pros converge.
                            Learn in real labs. Compete in live hackathons. Grind XP in{" "}
                            <span className="text-[#FF2EA6] font-bold glow-pink">HACK THE CITY</span>.
                            Get discovered by verified recruiters.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <Link to="/register" className="btn-primary flex items-center gap-2" data-testid="hero-cta-register">
                                <Rocket className="h-4 w-4" /> Boot Session <ChevronRight className="h-4 w-4" />
                            </Link>
                            <Link to="/city" className="btn-pink flex items-center gap-2" data-testid="hero-cta-city">
                                <MapPin className="h-4 w-4" /> Enter HackTheCity
                            </Link>
                            <Link to="/hub" className="btn-ghost flex items-center gap-2" data-testid="hero-cta-hub">
                                <Video className="h-4 w-4" /> Content Hub
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 max-w-3xl">
                            {[
                                { k: "users", label: "Operatives", color: "#00E5FF" },
                                { k: "videos", label: "Uploads", color: "#FF2EA6" },
                                { k: "courses", label: "Courses", color: "#00E5FF" },
                                { k: "missions", label: "Missions", color: "#FF2EA6" },
                                { k: "hackathons", label: "Live Events", color: "#E63946" },
                            ].map((s) => (
                                <div key={s.k} className="glass p-3 corners">
                                    <div className="term text-2xl md:text-3xl font-bold" style={{ color: s.color, textShadow: `0 0 12px ${s.color}55` }}>
                                        {stats[s.k] ?? 0}
                                    </div>
                                    <div className="term text-[9px] md:text-[10px] uppercase tracking-widest text-[#888] mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero right — HACK THE CITY key art */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative tilt">
                            <div className="absolute -inset-8 bg-gradient-to-br from-[#FF2EA6]/20 via-transparent to-[#00E5FF]/20 blur-2xl" />
                            <img
                                src={LOGOS.cityArt}
                                alt="Hack The City key art"
                                className="relative w-full rounded-lg border border-[#FF2EA6]/30 float-slow shadow-2xl"
                                style={{ filter: "drop-shadow(0 30px 60px rgba(255,46,166,0.35)) drop-shadow(0 20px 40px rgba(0,229,255,0.2))" }}
                            />
                            <div className="absolute -bottom-4 -right-4 glass-cyan px-3 py-2 rounded">
                                <div className="term text-[9px] uppercase tracking-[0.3em] text-[#00E5FF]">flagship module</div>
                            </div>
                            <div className="absolute -top-3 -left-3 glass-pink px-3 py-1 rounded">
                                <div className="term text-[9px] uppercase tracking-[0.3em] text-[#FF2EA6]">3D · gamified</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== TRUST STRIP ========== */}
            <section className="border-b border-[#1a1a1a] py-6 relative">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="flex items-center flex-wrap gap-x-10 gap-y-3 text-[10px] term uppercase tracking-[0.3em] text-[#666]">
                        <span className="text-[#00E5FF]">// trusted stack</span>
                        <span className="flex items-center gap-2"><Shield className="h-3 w-3 text-[#00E5FF]" /> jwt secured</span>
                        <span className="flex items-center gap-2"><Cpu className="h-3 w-3 text-[#FF2EA6]" /> real terminal</span>
                        <span className="flex items-center gap-2"><Radio className="h-3 w-3 text-[#00E5FF]" /> live websockets</span>
                        <span className="flex items-center gap-2"><Award className="h-3 w-3 text-[#FF2EA6]" /> instructor endorsements</span>
                        <span className="flex items-center gap-2"><Users className="h-3 w-3 text-[#E63946]" /> verified hr</span>
                    </div>
                </div>
            </section>

            {/* ========== MODULES ========== */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 md:py-28">
                <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <div className="term text-[10px] uppercase tracking-[0.4em] text-[#00E5FF] mb-3">// modules</div>
                        <h2 className="text-3xl md:text-5xl term font-bold">
                            Five pillars.<br />
                            <span className="neon-text">One arsenal.</span>
                        </h2>
                    </div>
                    <div className="text-[#666] term text-xs uppercase tracking-widest">v0.1.0 · winter release</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-5">
                    {/* HackTheCity — feature ANCHOR */}
                    <Link to="/city" className="card-term md:col-span-6 lg:col-span-12 p-6 md:p-10 group relative overflow-hidden card-pink" data-testid="pillar-city">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                            <div className="lg:col-span-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={LOGOS.hackTheCity} alt="HackTheCity" className="h-14 rounded object-cover" />
                                    <span className="badge-term badge-danger">FLAGSHIP</span>
                                </div>
                                <div className="term text-[10px] uppercase tracking-[0.3em] text-[#666] mb-2">03 // hack_the_city</div>
                                <h3 className="text-3xl md:text-5xl display neon-text mb-4 leading-none">HACK THE CITY</h3>
                                <p className="text-[#B0B0B0] text-sm md:text-base max-w-lg mb-6 leading-relaxed">
                                    A 3D neon metropolis where every district hides a mission. Bypass banks,
                                    sniff radio towers, crack vaults — through a live in-browser terminal.
                                    Age 14+.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="badge-term">SQL INJECTION</span>
                                    <span className="badge-term badge-pink">SOC ANALYSIS</span>
                                    <span className="badge-term">REVERSING</span>
                                    <span className="badge-term badge-pink">CRYPTO</span>
                                </div>
                                <div className="flex items-center gap-4 term text-xs">
                                    <span className="text-[#00E5FF] glow-cyan flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> earn xp</span>
                                    <span className="text-[#FF2EA6] glow-pink">unlock rank</span>
                                    <span className="text-white">get noticed</span>
                                </div>
                            </div>
                            <div className="lg:col-span-2 relative">
                                <div className="depth relative">
                                    <img src={LOGOS.character} alt="Operative" className="w-full aspect-square object-cover rounded-lg border border-[#FF2EA6]/40" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent rounded-lg" />
                                    <div className="absolute bottom-3 left-3 term text-[10px] uppercase tracking-widest text-[#00E5FF] bg-black/70 px-2 py-1 border border-[#00E5FF]/40">
                                        operative_01 • rookie
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Content Hub */}
                    <Link to="/hub" className="card-term md:col-span-6 lg:col-span-7 p-6 md:p-8 group relative overflow-hidden" data-testid="pillar-hub">
                        <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:opacity-25 transition">
                            <Video className="h-64 w-64 text-[#00E5FF]" />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="glass-cyan p-2 rounded"><Video className="h-5 w-5 text-[#00E5FF]" /></div>
                                <div className="term text-[10px] uppercase tracking-widest text-[#666]">01 // content_hub</div>
                            </div>
                            <h3 className="text-2xl md:text-3xl term font-bold mb-3 text-white">Researcher Content Hub</h3>
                            <p className="text-[#A0A0A0] text-sm md:text-base max-w-lg mb-6 leading-relaxed">
                                Long-form deep-dives and 60-second exploit tips. A portfolio recruiters actually watch.
                            </p>
                            <div className="term text-xs text-[#00E5FF] flex items-center gap-1 group-hover:translate-x-1 transition">
                                explore feed <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </Link>

                    {/* Academy */}
                    <Link to="/academy" className="card-term md:col-span-3 lg:col-span-5 p-6 group card-pink" data-testid="pillar-academy">
                        <div className="glass-pink p-2 rounded inline-block mb-4">
                            <GraduationCap className="h-5 w-5 text-[#FF2EA6]" />
                        </div>
                        <div className="term text-[10px] uppercase tracking-widest text-[#666] mb-2">02 // academy</div>
                        <h3 className="text-xl md:text-2xl term font-bold mb-2 text-white">HackTrick Academy</h3>
                        <p className="text-[#A0A0A0] text-sm mb-4">Courses + labs from certified experts. Freemium tier with instructor endorsements.</p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="badge-term">SQLI</span>
                            <span className="badge-term">RED TEAM</span>
                            <span className="badge-term badge-pink">FREEMIUM</span>
                        </div>
                    </Link>

                    {/* Recruitment */}
                    <Link to="/talent" className="card-term md:col-span-3 lg:col-span-6 p-6 group" data-testid="pillar-recruit">
                        <div className="glass-cyan p-2 rounded inline-block mb-4">
                            <Briefcase className="h-5 w-5 text-[#00E5FF]" />
                        </div>
                        <div className="term text-[10px] uppercase tracking-widest text-[#666] mb-2">04 // recruit</div>
                        <h3 className="text-xl md:text-2xl term font-bold mb-2 text-white">Recruitment Marketplace</h3>
                        <p className="text-[#A0A0A0] text-sm mb-4">
                            Verified HR portal. Filter talent by real project performance — not just resumes.
                        </p>
                        <div className="flex items-center gap-4 text-xs term text-[#888]">
                            <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-[#00E5FF]" /> proof of work</div>
                            <div className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[#FF2EA6]" /> hr verified</div>
                        </div>
                    </Link>

                    {/* Hackathons */}
                    <Link to="/hackathons" className="card-term md:col-span-3 lg:col-span-6 p-6 group card-pink" data-testid="pillar-hackathons">
                        <div className="glass-pink p-2 rounded inline-block mb-4">
                            <Trophy className="h-5 w-5 text-[#FF2EA6]" />
                        </div>
                        <div className="term text-[10px] uppercase tracking-widest text-[#666] mb-2">05 // hackathons</div>
                        <h3 className="text-xl md:text-2xl term font-bold mb-2 text-white">Live Virtual Hackathons</h3>
                        <p className="text-[#A0A0A0] text-sm mb-4">
                            Unified leaderboard for online + offline. Real-time chat & scoring via WebSocket.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="live-dot" />
                            <span className="term text-xs text-[#E63946] uppercase glow-red">next event live now</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className="border-y border-[#1a1a1a] py-20 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative">
                    <div className="mb-14 text-center">
                        <div className="term text-[10px] uppercase tracking-[0.4em] text-[#FF2EA6] mb-3">// pipeline</div>
                        <h2 className="text-3xl md:text-5xl term font-bold text-white">
                            From rookie <span className="text-[#00E5FF]">→</span> <span className="text-[#FF2EA6]">hired</span> in four moves.
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        <div className="hidden md:block absolute top-14 left-[12.5%] right-[12.5%] h-px divider-line" />
                        {[
                            { n: "01", title: "Register", desc: "Pick a role. Rookie XP starts at zero.", icon: Rocket },
                            { n: "02", title: "Hack The City", desc: "Solve missions, capture flags, earn XP.", icon: MapPin },
                            { n: "03", title: "Publish + Learn", desc: "Upload research to Hub. Take Academy courses.", icon: Video },
                            { n: "04", title: "Get Hired", desc: "Verified HR discovers your verified track record.", icon: Briefcase },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={i} className="glass p-6 relative corners" style={{ minHeight: "180px" }}>
                                    <div className="term text-3xl text-[#00E5FF] font-bold mb-2 glow-cyan">{s.n}</div>
                                    <div className="mb-3"><Icon className="h-5 w-5 text-[#FF2EA6]" /></div>
                                    <div className="term text-lg font-bold text-white mb-1">{s.title}</div>
                                    <div className="text-sm text-[#A0A0A0]">{s.desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ========== TESTIMONIAL / QUOTE ========== */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 md:py-24">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="term text-[10px] uppercase tracking-[0.4em] text-[#00E5FF] mb-3">// mission_briefing</div>
                        <h2 className="text-3xl md:text-4xl term font-bold text-white mb-4">
                            Cybersecurity isn't a course. It's a <span className="text-[#FF2EA6] glow-pink">craft</span>.
                        </h2>
                        <p className="text-[#A0A0A0] text-base leading-relaxed mb-6">
                            HackTrick was born because passive learning doesn't produce operatives. Every module here
                            simulates real adversarial thinking — from the SOC to the streets of HackTheCity.
                            If it feels like a game, that's the point. The industry rewards the ones who <span className="text-[#00E5FF]">ship</span>.
                        </p>
                        <ul className="space-y-2 text-sm">
                            {[
                                "Real penetration-testing missions, not multiple-choice quizzes",
                                "Instructor endorsements travel with your profile forever",
                                "Recruiters see your solved flags, not just your resume",
                                "Live hackathons blend online + offline participants seamlessly",
                            ].map((t) => (
                                <li key={t} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#00E5FF] mt-0.5 flex-shrink-0" />
                                    <span className="text-[#E0E0E0]">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative depth">
                        <img src={LOGOS.character} alt="Cybersecurity professional" className="w-full rounded-lg border border-[#333]"
                            style={{ filter: "drop-shadow(0 30px 60px rgba(0,229,255,0.2))" }} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent rounded-lg" />
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA ========== */}
            <section className="relative overflow-hidden border-y border-[#1a1a1a]">
                <div className="absolute inset-0">
                    <div className="orb drift" style={{ background: "radial-gradient(circle, #FF2EA6 0%, transparent 70%)", width: 500, height: 500, top: -100, left: "20%", opacity: 0.3 }} />
                    <div className="orb drift-slow" style={{ background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)", width: 500, height: 500, bottom: -100, right: "20%", opacity: 0.3 }} />
                </div>
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-20 md:py-28 relative text-center">
                    <div className="term text-[10px] uppercase tracking-[0.4em] text-[#E63946] mb-4 flex items-center justify-center gap-2">
                        <span className="live-dot" /> the arena is open
                    </div>
                    <h2 className="text-4xl md:text-6xl term font-bold text-white mb-4">
                        <span className="text-white">ready to</span> <span className="neon-text">hack the city?</span>
                    </h2>
                    <p className="text-[#A0A0A0] text-base md:text-lg max-w-xl mx-auto mb-8">
                        Boot your session. Solve your first mission in the next 60 seconds.
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link to="/register" className="btn-primary flex items-center gap-2 !py-3 !px-6 !text-sm" data-testid="cta-register">
                            <Terminal className="h-4 w-4" /> $ ./boot_session
                        </Link>
                        <Link to="/city" className="btn-pink flex items-center gap-2 !py-3 !px-6 !text-sm" data-testid="cta-city">
                            <MapPin className="h-4 w-4" /> Enter HackTheCity
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="py-10">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src={LOGOS.hacktrick} alt="HackTrick" className="h-8 w-auto object-contain" />
                        <div className="term text-xs text-[#666]">
                            © 2026 hacktrick.in — <span className="text-[#00E5FF]">stay curious. stay ethical.</span>
                        </div>
                    </div>
                    <div className="term text-[10px] uppercase tracking-widest text-[#555]">
                        uptime 99.98% · node: nyc-3 · build 0x00E5FF
                    </div>
                </div>
            </footer>
        </div>
    );
}
