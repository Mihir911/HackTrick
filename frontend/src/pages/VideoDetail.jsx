import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Heart, Eye, MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function VideoDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [video, setVideo] = useState(null);
    const [comment, setComment] = useState("");
    const isAuthed = user && user !== false;

    useEffect(() => { load(); }, [id]);
    const load = async () => {
        const { data } = await api.get(`/videos/${id}`);
        setVideo(data);
    };

    if (!video) return <div className="max-w-4xl mx-auto p-8 term text-[#555] cursor-blink">loading</div>;

    const isLiked = isAuthed && video.likes?.includes(user.id);

    const toggleLike = async () => {
        if (!isAuthed) return toast.error("Login to like");
        await api.post(`/videos/${id}/like`);
        load();
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        await api.post(`/videos/${id}/comment`, { text: comment });
        setComment("");
        load();
    };

    const embedSrc = video.storage_path
        ? `${process.env.REACT_APP_ORIGIN || process.env.ORIGIN}/api/files/${video.storage_path}`
        : video.external_url;

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
            <Link to="/hub" className="term text-xs text-[#888] hover:text-[#00E5FF] mb-4 inline-flex items-center gap-1" data-testid="video-back">
                <ArrowLeft className="h-3 w-3" /> back to feed
            </Link>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className={`bg-black border border-[#333] relative ${video.video_type === "short" ? "max-w-[400px] aspect-[9/16]" : "aspect-video"}`}>
                        {video.storage_path ? (
                            <video src={embedSrc} controls className="w-full h-full" data-testid="video-player" />
                        ) : (
                            <iframe src={embedSrc} title={video.title} className="w-full h-full" allowFullScreen data-testid="video-iframe" />
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl term font-bold mt-4 mb-2">{video.title}</h1>
                    <div className="flex items-center gap-4 term text-xs text-[#888] uppercase mb-3">
                        <Link to={`/profile/${video.owner_id}`} className="text-[#00E5FF]" data-testid="video-owner">{video.owner_name}</Link>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {video.views}</span>
                        <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                        {video.tags?.map(t => <span key={t} className="badge-term">{t}</span>)}
                    </div>
                    <p className="text-[#E0E0E0] text-sm leading-relaxed whitespace-pre-wrap">{video.description}</p>
                    <div className="mt-4 flex gap-3">
                        <button onClick={toggleLike} className={`btn-ghost flex items-center gap-2 ${isLiked ? "text-[#FF3B30] border-[#FF3B30]" : ""}`} data-testid="video-like-btn">
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} /> {video.likes?.length || 0}
                        </button>
                    </div>
                </div>

                <div>
                    <div className="card-term p-4">
                        <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3 flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" /> // comments ({video.comments?.length || 0})
                        </div>
                        {isAuthed && (
                            <form onSubmit={submitComment} className="mb-4">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="input-term min-h-[60px] mb-2"
                                    placeholder="drop a comment..."
                                    data-testid="comment-input"
                                />
                                <button type="submit" className="btn-primary !py-1.5 !text-xs" data-testid="comment-submit">post</button>
                            </form>
                        )}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {video.comments?.map(c => (
                                <div key={c.id} className="border-b border-[#333]/50 pb-2">
                                    <div className="term text-[10px] uppercase text-[#00E5FF]">{c.user_name}</div>
                                    <div className="text-sm text-[#E0E0E0]">{c.text}</div>
                                </div>
                            ))}
                            {(!video.comments || video.comments.length === 0) && (
                                <div className="term text-xs text-[#555]">// no comments yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
