import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { formatError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Award, Zap, Send } from "lucide-react";

export default function TalentDetail() {
    const { id } = useParams();
    const [t, setT] = useState(null);
    const [offer, setOffer] = useState({ type: "full_time", title: "", message: "", compensation: "" });
    const [showOffer, setShowOffer] = useState(false);

    useEffect(() => {
        api.get(`/talent/${id}`).then(r => setT(r.data));
    }, [id]);

    const sendOffer = async (e) => {
        e.preventDefault();
        try {
            await api.post("/offers", { candidate_id: id, ...offer });
            toast.success("Offer sent");
            setShowOffer(false);
        } catch (e) {
            toast.error(formatError(e.response?.data));
        }
    };

    if (!t) return <div className="p-8 term text-[#555] cursor-blink">loading</div>;

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
            <Link to="/talent" className="term text-xs text-[#888] hover:text-[#00E5FF] mb-4 inline-flex items-center gap-1" data-testid="talent-back">
                <ArrowLeft className="h-3 w-3" /> back to marketplace
            </Link>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="card-term p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="term text-[10px] uppercase tracking-widest text-[#00E5FF] mb-1">// operative_id: {t.id.slice(0, 8)}</div>
                                <h1 className="text-2xl md:text-3xl term font-bold">{t.name}</h1>
                                <div className="mt-2 flex gap-2 flex-wrap">
                                    <span className="badge-term">{t.role}</span>
                                    <span className="badge-term badge-yellow">rank: {t.rank}</span>
                                    <span className="badge-term badge-info flex items-center gap-1"><Zap className="h-3 w-3" /> {t.xp} xp</span>
                                </div>
                            </div>
                            <button onClick={() => setShowOffer(!showOffer)} className="btn-primary flex items-center gap-2" data-testid="talent-hire-btn">
                                <Send className="h-3.5 w-3.5" /> hire
                            </button>
                        </div>
                        <p className="text-[#E0E0E0] text-sm">{t.bio || "// no bio set"}</p>
                        <div className="mt-4 pt-4 border-t border-[#333]">
                            <div className="term text-[10px] uppercase tracking-widest text-[#555] mb-2">skills</div>
                            <div className="flex gap-2 flex-wrap">
                                {t.skills?.length ? t.skills.map(s => <span key={s} className="badge-term">{s}</span>) : <span className="text-[#555] text-xs term">// none listed</span>}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#333] grid grid-cols-3 gap-4">
                            <Stat label="Missions solved" value={t.solved_missions} />
                            <Stat label="Endorsements" value={t.endorsements?.length || 0} />
                            <Stat label="Uploads" value={t.videos?.length || 0} />
                        </div>
                    </div>

                    {showOffer && (
                        <form onSubmit={sendOffer} className="card-term p-5 space-y-3">
                            <div className="term text-xs uppercase tracking-widest text-[#00E5FF]">// send_offer</div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <select value={offer.type} onChange={(e) => setOffer({ ...offer, type: e.target.value })} className="input-term" data-testid="offer-type">
                                    <option value="full_time">Full-time</option>
                                    <option value="project">Project-based</option>
                                    <option value="internship">Internship</option>
                                </select>
                                <input value={offer.compensation} onChange={(e) => setOffer({ ...offer, compensation: e.target.value })}
                                    className="input-term" placeholder="compensation e.g. $80k" data-testid="offer-comp" />
                            </div>
                            <input value={offer.title} onChange={(e) => setOffer({ ...offer, title: e.target.value })}
                                className="input-term" placeholder="role title" required data-testid="offer-title" />
                            <textarea value={offer.message} onChange={(e) => setOffer({ ...offer, message: e.target.value })}
                                className="input-term min-h-[80px]" placeholder="message to candidate..." required data-testid="offer-message" />
                            <button type="submit" className="btn-primary" data-testid="offer-send">$ ./transmit_offer</button>
                        </form>
                    )}

                    {t.videos?.length > 0 && (
                        <div className="card-term p-5">
                            <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3">// portfolio_uploads</div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {t.videos.map(v => (
                                    <Link to={`/hub/${v.id}`} key={v.id} className="border border-[#333] p-2 hover:border-[#00E5FF]/50 transition text-sm">
                                        <div className="text-[#E0E0E0] truncate">{v.title}</div>
                                        <div className="term text-[10px] text-[#555] uppercase">{v.video_type} • {v.views} views</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div className="card-term p-4">
                        <div className="term text-xs uppercase tracking-widest text-[#FF2EA6] mb-3 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" /> // endorsements
                        </div>
                        {t.endorsements?.length ? (
                            <div className="space-y-3">
                                {t.endorsements.map(e => (
                                    <div key={e.id} className="border-b border-[#333]/50 pb-3">
                                        <div className="term text-[10px] uppercase text-[#00E5FF]">{e.instructor_name}</div>
                                        <div className="text-sm text-[#E0E0E0] mt-1">"{e.note}"</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="term text-xs text-[#555]">// no endorsements yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <div className="term text-2xl text-[#00E5FF] font-bold">{value ?? 0}</div>
            <div className="term text-[10px] uppercase tracking-widest text-[#555] mt-1">{label}</div>
        </div>
    );
}
