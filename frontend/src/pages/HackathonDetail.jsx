import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Trophy, Send, Zap, Users, MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";

export default function HackathonDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [chat, setChat] = useState([]);
    const [msg, setMsg] = useState("");
    const [flag, setFlag] = useState("");
    const [activeCh, setActiveCh] = useState(null);
    const [mode, setMode] = useState("online");
    const [joined, setJoined] = useState(false);
    const wsRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        load();
        loadChat();
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        // Connect WebSocket for real-time chat + leaderboard
        const token = localStorage.getItem("ht_token");
        const wsUrl = API.replace(/^http/, "ws") + `/ws/hackathon/${id}`;
        try {
            const ws = new WebSocket(wsUrl);
            ws.onopen = () => { wsRef.current = ws; };
            ws.onmessage = (e) => {
                try {
                    const m = JSON.parse(e.data);
                    if (m.type === "leaderboard") {
                        setLeaderboard(m.leaderboard || []);
                        if (m.solve) {
                            toast.success(`${m.solve.user_name} solved "${m.solve.challenge_title}" +${m.solve.points}`);
                        }
                    } else if (m.type === "chat" || !m.type) {
                        setChat(prev => [...prev, m]);
                    }
                } catch { }
            };
            ws.onclose = () => { wsRef.current = null; };
            return () => ws.close();
        } catch {
            // Polling fallback when WS not available
            const iv = setInterval(loadLeaderboard, 5000);
            return () => clearInterval(iv);
        }
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }, [chat]);

    const load = async () => {
        const { data } = await api.get(`/hackathons/${id}`);
        setEvent(data);
        setLeaderboard(data.leaderboard || []);
        if (user && data.participants?.some(p => p.user_id === user.id)) setJoined(true);
    };
    const loadLeaderboard = async () => {
        try {
            const { data } = await api.get(`/hackathons/${id}/leaderboard`);
            setLeaderboard(data);
        } catch { }
    };
    const loadChat = async () => {
        try {
            const { data } = await api.get(`/hackathons/${id}/chat`);
            setChat(data);
        } catch { }
    };

    const join = async () => {
        await api.post(`/hackathons/${id}/join?mode=${mode}`);
        setJoined(true);
        toast.success(`Joined as ${mode} participant`);
        load();
    };

    const submitFlag = async (e) => {
        e.preventDefault();
        if (!activeCh) return;
        const { data } = await api.post(`/hackathons/${id}/submit`, { challenge_id: activeCh.id, flag });
        if (data.correct) {
            toast.success(`+${data.points_awarded} pts`);
            setFlag("");
            loadLeaderboard();
        } else {
            toast.error("Incorrect flag");
        }
    };

    const sendChat = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        const token = localStorage.getItem("ht_token");
        if (wsRef.current && wsRef.current.readyState === 1) {
            wsRef.current.send(JSON.stringify({ token, text: msg }));
        } else {
            await api.post(`/hackathons/${id}/chat`, { hackathon_id: id, text: msg });
            loadChat();
        }
        setMsg("");
    };

    if (!event) return <div className="p-8 term text-[#555] cursor-blink">loading</div>;

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
            <Link to="/hackathons" className="term text-xs text-[#888] hover:text-[#00E5FF] mb-4 inline-flex items-center gap-1" data-testid="hack-back">
                <ArrowLeft className="h-3 w-3" /> back to events
            </Link>

            <div className="card-term p-6 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="term text-[10px] uppercase tracking-[0.3em] text-[#FF3B30] mb-2 flex items-center gap-2">
                            <span className="live-dot" /> live event
                        </div>
                        <h1 className="text-2xl md:text-3xl term font-bold mb-2">{event.title}</h1>
                        <p className="text-[#888] text-sm max-w-xl">{event.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!joined ? (
                            <>
                                <select value={mode} onChange={(e) => setMode(e.target.value)} className="input-term !py-2 !w-auto" data-testid="hack-mode-select">
                                    <option value="online">Online</option>
                                    <option value="offline">Offline (In-person)</option>
                                </select>
                                <button onClick={join} className="btn-primary" data-testid="hack-join-btn">$ ./join_event</button>
                            </>
                        ) : (
                            <span className="badge-term flex items-center gap-1 !text-xs !px-3 !py-1.5">
                                <MonitorSmartphone className="h-3 w-3" /> joined as {mode}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Challenges */}
                <div className="lg:col-span-5">
                    <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3 flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5" /> // challenges
                    </div>
                    <div className="space-y-3">
                        {event.challenges.map(ch => (
                            <div
                                key={ch.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setActiveCh(ch)}
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActiveCh(ch)}
                                data-testid={`challenge-${ch.id}`}
                                className={`w-full text-left card-term p-4 border transition cursor-pointer ${activeCh?.id === ch.id ? "border-[#00E5FF]" : ""
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="term text-sm font-bold text-[#E0E0E0]">{ch.title}</div>
                                    <span className="badge-term badge-yellow">{ch.points} pts</span>
                                </div>
                                <div className="term text-[10px] uppercase tracking-widest text-[#555]">{ch.category}</div>
                                {activeCh?.id === ch.id && (
                                    <div className="mt-3 pt-3 border-t border-[#333]" onClick={(e) => e.stopPropagation()}>
                                        <div className="term text-xs text-[#E0E0E0] mb-3 whitespace-pre-wrap">{ch.prompt}</div>
                                        <form onSubmit={submitFlag} className="flex gap-2">
                                            <input value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="submit flag..."
                                                className="input-term !py-2 flex-1" data-testid="challenge-flag-input" />
                                            <button type="submit" className="btn-primary !py-2 !text-xs" data-testid="challenge-submit-btn">
                                                <Zap className="h-3.5 w-3.5" />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="lg:col-span-4">
                    <div className="term text-xs uppercase tracking-widest text-[#FF2EA6] mb-3 flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5" /> // unified_leaderboard
                    </div>
                    <div className="card-term p-4">
                        <div className="grid grid-cols-12 term text-[10px] uppercase tracking-widest text-[#555] pb-2 border-b border-[#333]">
                            <div className="col-span-1">#</div>
                            <div className="col-span-6">operative</div>
                            <div className="col-span-2">mode</div>
                            <div className="col-span-3 text-right">points</div>
                        </div>
                        {leaderboard.length === 0 && (
                            <div className="term text-xs text-[#555] py-4 text-center">// no submissions yet</div>
                        )}
                        {leaderboard.map((row, i) => (
                            <div key={row.user_id} className="grid grid-cols-12 items-center py-2 border-b border-[#333]/50 term text-sm">
                                <div className={`col-span-1 font-bold ${i < 3 ? "text-[#FF2EA6]" : "text-[#555]"}`}>#{i + 1}</div>
                                <div className="col-span-6 text-[#E0E0E0] truncate">{row.user_name}</div>
                                <div className="col-span-2 text-[10px] text-[#00E5FF] uppercase">{row.mode}</div>
                                <div className="col-span-3 text-right text-[#00E5FF] font-bold">{row.total_points}</div>
                            </div>
                        ))}
                    </div>
                    <div className="term text-[10px] text-[#555] mt-2 flex items-center gap-2">
                        <span className="live-dot" /> live via websocket
                    </div>
                </div>

                {/* Chat */}
                <div className="lg:col-span-3">
                    <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" /> // live_chat
                    </div>
                    <div className="card-term flex flex-col h-[420px]">
                        <div ref={chatEndRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                            {chat.map(m => (
                                <div key={m.id} className="term text-xs">
                                    <span className="text-[#00E5FF]">{m.user_name}</span>
                                    <span className="text-[#555]"> ~$ </span>
                                    <span className="text-[#E0E0E0]">{m.text}</span>
                                </div>
                            ))}
                            {chat.length === 0 && <div className="term text-xs text-[#555]">// no messages</div>}
                        </div>
                        <form onSubmit={sendChat} className="flex border-t border-[#333]">
                            <input value={msg} onChange={(e) => setMsg(e.target.value)}
                                placeholder="chat..." className="flex-1 bg-transparent px-3 py-2 term text-xs text-[#E0E0E0] outline-none"
                                data-testid="chat-input" />
                            <button type="submit" className="px-3 text-[#00E5FF] border-l border-[#333]" data-testid="chat-send">
                                <Send className="h-3.5 w-3.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
