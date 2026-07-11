import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Trophy, Users, Calendar } from "lucide-react";

export default function Hackathons() {
    const [events, setEvents] = useState([]);
    useEffect(() => { api.get("/hackathons").then(r => setEvents(r.data)); }, []);

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="mb-6">
                <div className="term text-[10px] uppercase tracking-[0.3em] text-[#FF3B30] mb-2 flex items-center gap-2">
                    <span className="live-dot" /> // live_arena
                </div>
                <h1 className="text-3xl md:text-4xl term font-bold">Virtual Hackathons</h1>
                <p className="text-[#888] text-sm mt-2 max-w-xl">Unified leaderboard for online + offline participants. Solve challenges, chat in real-time, climb.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(h => (
                    <Link key={h.id} to={`/hackathons/${h.id}`} className="card-term p-5 block group" data-testid={`hack-card-${h.id}`}>
                        <div className="flex items-start justify-between mb-3">
                            <Trophy className="h-6 w-6 text-[#FF2EA6]" />
                            <span className="badge-term badge-danger flex items-center gap-1"><span className="live-dot" /> LIVE</span>
                        </div>
                        <h3 className="text-xl term font-bold group-hover:text-[#00E5FF] transition mb-2">{h.title}</h3>
                        <p className="text-[#888] text-sm mb-4 line-clamp-2">{h.description}</p>
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#333]">
                            <StatMini icon={Calendar} label="starts" value={new Date(h.start_time).toLocaleDateString()} />
                            <StatMini icon={Users} label="joined" value={h.participant_count} />
                            <StatMini icon={Trophy} label="challenges" value={h.challenges?.length || 0} />
                        </div>
                    </Link>
                ))}
                {events.length === 0 && (
                    <div className="col-span-full card-term p-12 text-center term text-[#555]">// no events scheduled</div>
                )}
            </div>
        </div>
    );
}

function StatMini({ icon: Icon, label, value }) {
    return (
        <div>
            <div className="flex items-center gap-1 term text-[10px] text-[#555] uppercase tracking-widest">
                <Icon className="h-3 w-3" /> {label}
            </div>
            <div className="text-sm text-[#E0E0E0] term font-bold mt-1">{value}</div>
        </div>
    );
}
