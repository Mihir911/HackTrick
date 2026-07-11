import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Upload, Play, Heart, Eye } from "lucide-react";

export default function ContentHub() {
    const { user } = useAuth();
    const [tab, setTab] = useState("all");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = tab === "all" ? "" : `?video_type=${tab}`;
        api.get(`/videos${q}`).then(r => setVideos(r.data)).finally(() => setLoading(false));
    }, [tab]);

    const shorts = videos.filter(v => v.video_type === "short");
    const longs = videos.filter(v => v.video_type === "long");

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                <div>
                    <div className="term text-[10px] uppercase tracking-[0.3em] text-[#00E5FF] mb-2">// content_hub</div>
                    <h1 className="text-3xl md:text-4xl term font-bold">Researcher Feed</h1>
                    <p className="text-[#888] text-sm mt-2 max-w-xl">Long-form deep-dives and 60-sec exploit tips. Build a portfolio recruiters actually watch.</p>
                </div>
                {user && user !== false && (
                    <Link to="/hub/upload" className="btn-primary flex items-center gap-2" data-testid="hub-upload-btn">
                        <Upload className="h-4 w-4" /> Upload
                    </Link>
                )}
            </div>

            <div className="flex gap-2 mb-6 border-b border-[#333]">
                {["all", "long", "short"].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`term text-xs uppercase tracking-widest px-4 py-2 border-b-2 transition ${tab === t ? "border-[#00E5FF] text-[#00E5FF]" : "border-transparent text-[#888] hover:text-[#E0E0E0]"
                            }`}
                        data-testid={`hub-tab-${t}`}
                    >
                        {t === "long" ? "long-form" : t === "short" ? "shorts" : "all"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="term text-[#555] cursor-blink">loading feed</div>
            ) : (
                <>
                    {(tab === "all" || tab === "short") && shorts.length > 0 && (
                        <div className="mb-10">
                            <div className="term text-xs uppercase tracking-widest text-[#FF2EA6] mb-3">// shorts • 60s</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {shorts.map(v => <ShortCard key={v.id} video={v} />)}
                            </div>
                        </div>
                    )}
                    {(tab === "all" || tab === "long") && longs.length > 0 && (
                        <div>
                            <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3">// long-form</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {longs.map(v => <LongCard key={v.id} video={v} />)}
                            </div>
                        </div>
                    )}
                    {videos.length === 0 && (
                        <div className="card-term p-12 text-center">
                            <div className="term text-[#555] mb-3">// no content yet</div>
                            <div className="text-[#888] text-sm">Be the first researcher to publish.</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ShortCard({ video }) {
    return (
        <Link to={`/hub/${video.id}`} className="card-term overflow-hidden group block" data-testid={`short-card-${video.id}`}>
            <div className="aspect-[9/16] bg-[#050505] relative overflow-hidden">
                {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-10 w-10 text-[#00E5FF]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute top-2 left-2">
                    <span className="badge-term badge-yellow">SHORT</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-sm text-[#E0E0E0] font-medium truncate">{video.title}</div>
                    <div className="term text-[10px] text-[#00E5FF] uppercase">{video.owner_name}</div>
                </div>
            </div>
        </Link>
    );
}

function LongCard({ video }) {
    return (
        <Link to={`/hub/${video.id}`} className="card-term overflow-hidden group block" data-testid={`long-card-${video.id}`}>
            <div className="aspect-video bg-[#050505] relative">
                {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-12 w-12 text-[#00E5FF]" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute top-2 right-2 term text-[10px] text-[#00E5FF] bg-black/70 px-2 py-1">
                    {video.duration_sec ? `${Math.floor(video.duration_sec / 60)}:${String(video.duration_sec % 60).padStart(2, "0")}` : "LIVE"}
                </div>
            </div>
            <div className="p-3">
                <div className="text-sm text-[#E0E0E0] font-medium line-clamp-2 mb-1">{video.title}</div>
                <div className="flex items-center gap-3 term text-[10px] text-[#555] uppercase">
                    <span className="text-[#00E5FF]">{video.owner_name}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {video.views}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {video.likes?.length || 0}</span>
                </div>
            </div>
        </Link>
    );
}
