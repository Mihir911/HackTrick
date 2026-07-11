import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Zap, Award, Video, Edit3 } from "lucide-react";

export default function Profile() {
    const { id } = useParams();
    const { user, refresh } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", bio: "", skills: "" });
    const targetId = id || user?.id;
    const isSelf = user && !id;

    useEffect(() => {
        if (!targetId) return;
        api.get(`/users/${targetId}`).then(r => {
            setProfile(r.data);
            setForm({ name: r.data.name, bio: r.data.bio || "", skills: (r.data.skills || []).join(", ") });
        });
    }, [targetId]);

    const save = async (e) => {
        e.preventDefault();
        const skills = form.skills.split(",").map(s => s.trim()).filter(Boolean);
        await api.patch("/users/me", { name: form.name, bio: form.bio, skills });
        toast.success("Profile updated");
        setEditing(false);
        await refresh();
        const { data } = await api.get(`/users/${targetId}`);
        setProfile(data);
    };

    if (!profile) return <div className="p-8 term text-[#555] cursor-blink">loading</div>;

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
            <div className="card-term p-6 mb-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                    <div>
                        <div className="term text-[10px] uppercase tracking-widest text-[#00E5FF] mb-1">// operative_profile</div>
                        <h1 className="text-3xl md:text-4xl term font-bold">{profile.name}</h1>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            <span className="badge-term">{profile.role}</span>
                            <span className="badge-term badge-yellow">rank: {profile.rank}</span>
                            <span className="badge-term badge-info flex items-center gap-1"><Zap className="h-3 w-3" /> {profile.xp} xp</span>
                        </div>
                    </div>
                    {isSelf && (
                        <button onClick={() => setEditing(!editing)} className="btn-ghost flex items-center gap-2" data-testid="profile-edit-btn">
                            <Edit3 className="h-3.5 w-3.5" /> {editing ? "cancel" : "edit"}
                        </button>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={save} className="space-y-3">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-term" placeholder="name" data-testid="profile-name-input" />
                        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            className="input-term min-h-[80px]" placeholder="bio..." data-testid="profile-bio-input" />
                        <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                            className="input-term" placeholder="skills (comma-separated)" data-testid="profile-skills-input" />
                        <button type="submit" className="btn-primary" data-testid="profile-save-btn">$ ./save</button>
                    </form>
                ) : (
                    <>
                        <p className="text-sm text-[#E0E0E0]">{profile.bio || "// no bio set"}</p>
                        <div className="mt-4 pt-4 border-t border-[#333]">
                            <div className="term text-[10px] uppercase tracking-widest text-[#555] mb-2">skills</div>
                            <div className="flex gap-2 flex-wrap">
                                {profile.skills?.length ? profile.skills.map(s => <span key={s} className="badge-term">{s}</span>) : <span className="term text-xs text-[#555]">// none</span>}
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-6 pt-4 border-t border-[#333] grid grid-cols-3 gap-4">
                    <Stat label="Missions solved" value={profile.solved_missions} accent="#00E5FF" />
                    <Stat label="Endorsements" value={profile.endorsements?.length || 0} accent="#FF2EA6" />
                    <Stat label="Uploads" value={profile.videos?.length || 0} accent="#00E5FF" />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card-term p-5">
                    <div className="term text-xs uppercase tracking-widest text-[#FF2EA6] mb-3 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> // endorsements
                    </div>
                    {profile.endorsements?.length ? (
                        <div className="space-y-3">
                            {profile.endorsements.map(e => (
                                <div key={e.id} className="border-b border-[#333]/50 pb-3">
                                    <div className="term text-[10px] uppercase text-[#00E5FF]">{e.instructor_name}</div>
                                    <div className="text-sm text-[#E0E0E0] mt-1">"{e.note}"</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="term text-xs text-[#555]">// awaiting first endorsement</div>
                    )}
                </div>

                <div className="card-term p-5">
                    <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3 flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" /> // uploads
                    </div>
                    {profile.videos?.length ? (
                        <div className="space-y-2">
                            {profile.videos.map(v => (
                                <Link to={`/hub/${v.id}`} key={v.id} className="block border border-[#333] p-3 hover:border-[#00E5FF]/50 transition">
                                    <div className="text-sm text-[#E0E0E0] truncate">{v.title}</div>
                                    <div className="term text-[10px] text-[#555] uppercase">{v.video_type} • {v.views} views</div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="term text-xs text-[#555]">// no uploads yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, accent }) {
    return (
        <div>
            <div className="term text-2xl font-bold" style={{ color: accent }}>{value ?? 0}</div>
            <div className="term text-[10px] uppercase tracking-widest text-[#555] mt-1">{label}</div>
        </div>
    );
}
