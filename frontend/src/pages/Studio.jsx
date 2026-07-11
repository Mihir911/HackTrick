import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { GraduationCap, Trophy, Award, Plus, X, Users } from "lucide-react";

export default function Studio() {
    const { user } = useAuth();
    const [tab, setTab] = useState("courses");

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
            <div className="mb-6">
                <div className="term text-[10px] uppercase tracking-[0.3em] text-[#FF2EA6] mb-2">// instructor_studio</div>
                <h1 className="text-3xl md:text-4xl term font-bold">
                    <span className="text-[#FF2EA6] glow-pink">Studio</span> <span className="text-white">/</span> {user?.name}
                </h1>
                <p className="text-[#888] text-sm mt-2">Publish courses, host hackathons, endorse rising talent.</p>
            </div>

            <div className="flex gap-1 mb-6 border-b border-[#333]">
                {[
                    { k: "courses", label: "New Course", icon: GraduationCap },
                    { k: "hackathons", label: "New Hackathon", icon: Trophy },
                    { k: "endorse", label: "Endorse Talent", icon: Award },
                ].map(t => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.k}
                            onClick={() => setTab(t.k)}
                            className={`term text-xs uppercase tracking-widest px-4 py-3 border-b-2 flex items-center gap-2 transition ${tab === t.k
                                    ? "border-[#FF2EA6] text-[#FF2EA6]"
                                    : "border-transparent text-[#888] hover:text-white"
                                }`}
                            data-testid={`studio-tab-${t.k}`}
                        >
                            <Icon className="h-4 w-4" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === "courses" && <CourseForm />}
            {tab === "hackathons" && <HackathonForm />}
            {tab === "endorse" && <EndorseForm />}
        </div>
    );
}

// ============ COURSE FORM ============
function CourseForm() {
    const [form, setForm] = useState({
        title: "", description: "", is_free: true, price: 0,
        difficulty: "beginner", tags: "", thumbnail_url: "",
    });
    const [lessons, setLessons] = useState([{ title: "", duration: "", content: "" }]);
    const [busy, setBusy] = useState(false);

    const addLesson = () => setLessons([...lessons, { title: "", duration: "", content: "" }]);
    const removeLesson = (i) => setLessons(lessons.filter((_, idx) => idx !== i));
    const updateLesson = (i, k, v) => setLessons(lessons.map((l, idx) => idx === i ? { ...l, [k]: v } : l));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price) || 0,
                tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
                lessons: lessons.filter(l => l.title.trim()),
                thumbnail_url: form.thumbnail_url || null,
            };
            const { data } = await api.post("/courses", payload);
            toast.success("Course published");
            window.location.href = `/academy/${data.id}`;
        } catch (e) {
            toast.error(formatError(e.response?.data));
        } finally { setBusy(false); }
    };

    return (
        <form onSubmit={submit} className="card-term p-6 space-y-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-term" placeholder="course title" data-testid="course-title-input" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-term min-h-[80px]" placeholder="what will students learn?" data-testid="course-desc-input" />
            <div className="grid sm:grid-cols-3 gap-3">
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="input-term" data-testid="course-difficulty">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                <select value={form.is_free ? "free" : "paid"} onChange={(e) => setForm({ ...form, is_free: e.target.value === "free" })}
                    className="input-term" data-testid="course-pricing">
                    <option value="free">Free / Freemium</option>
                    <option value="paid">Paid</option>
                </select>
                {!form.is_free && (
                    <input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="input-term" placeholder="price USD" data-testid="course-price" />
                )}
            </div>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="input-term" placeholder="tags (comma-separated): red-team, web, sqli" data-testid="course-tags" />
            <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                className="input-term" placeholder="thumbnail url (optional)" data-testid="course-thumb" />

            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="term text-[10px] uppercase tracking-widest text-[#00E5FF]">// lessons</div>
                    <button type="button" onClick={addLesson} className="btn-ghost !py-1 !text-[10px] flex items-center gap-1" data-testid="add-lesson">
                        <Plus className="h-3 w-3" /> add
                    </button>
                </div>
                <div className="space-y-2">
                    {lessons.map((l, i) => (
                        <div key={i} className="border border-[#333] p-3 space-y-2 relative">
                            <div className="grid grid-cols-3 gap-2">
                                <input value={l.title} onChange={(e) => updateLesson(i, "title", e.target.value)}
                                    className="input-term col-span-2 !py-2" placeholder={`lesson ${i + 1} title`} data-testid={`lesson-title-${i}`} />
                                <input value={l.duration} onChange={(e) => updateLesson(i, "duration", e.target.value)}
                                    className="input-term !py-2" placeholder="15:30" data-testid={`lesson-duration-${i}`} />
                            </div>
                            <textarea value={l.content} onChange={(e) => updateLesson(i, "content", e.target.value)}
                                className="input-term min-h-[50px]" placeholder="lesson notes / content" data-testid={`lesson-content-${i}`} />
                            {lessons.length > 1 && (
                                <button type="button" onClick={() => removeLesson(i)}
                                    className="absolute top-2 right-2 text-[#FF3B30] hover:text-white" data-testid={`remove-lesson-${i}`}>
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={busy} className="btn-pink w-full" data-testid="course-publish">
                {busy ? "publishing..." : "$ ./publish_course"}
            </button>
        </form>
    );
}

// ============ HACKATHON FORM ============
function HackathonForm() {
    const [form, setForm] = useState({
        title: "", description: "",
        start_time: new Date().toISOString().slice(0, 16),
        end_time: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    });
    const [challenges, setChallenges] = useState([{ title: "", category: "Web", points: 100, prompt: "", flag: "" }]);
    const [busy, setBusy] = useState(false);

    const addCh = () => setChallenges([...challenges, { title: "", category: "Web", points: 100, prompt: "", flag: "" }]);
    const removeCh = (i) => setChallenges(challenges.filter((_, idx) => idx !== i));
    const updateCh = (i, k, v) => setChallenges(challenges.map((c, idx) => idx === i ? { ...c, [k]: v } : c));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                start_time: new Date(form.start_time).toISOString(),
                end_time: new Date(form.end_time).toISOString(),
                challenges: challenges.filter(c => c.title.trim() && c.flag.trim()).map(c => ({
                    ...c, points: Number(c.points) || 100
                })),
            };
            const { data } = await api.post("/hackathons", payload);
            toast.success("Hackathon launched");
            window.location.href = `/hackathons/${data.id}`;
        } catch (e) {
            toast.error(formatError(e.response?.data));
        } finally { setBusy(false); }
    };

    return (
        <form onSubmit={submit} className="card-term p-6 space-y-4">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-term" placeholder="event title" data-testid="hack-title-input" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-term min-h-[80px]" placeholder="event description" data-testid="hack-desc-input" />
            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">start</label>
                    <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        className="input-term" data-testid="hack-start" />
                </div>
                <div>
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">end</label>
                    <input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        className="input-term" data-testid="hack-end" />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="term text-[10px] uppercase tracking-widest text-[#00E5FF]">// challenges</div>
                    <button type="button" onClick={addCh} className="btn-ghost !py-1 !text-[10px] flex items-center gap-1" data-testid="add-challenge">
                        <Plus className="h-3 w-3" /> add
                    </button>
                </div>
                <div className="space-y-2">
                    {challenges.map((c, i) => (
                        <div key={i} className="border border-[#333] p-3 space-y-2 relative">
                            <div className="grid grid-cols-6 gap-2">
                                <input value={c.title} onChange={(e) => updateCh(i, "title", e.target.value)}
                                    className="input-term col-span-3 !py-2" placeholder="challenge title" data-testid={`ch-title-${i}`} />
                                <select value={c.category} onChange={(e) => updateCh(i, "category", e.target.value)}
                                    className="input-term col-span-2 !py-2" data-testid={`ch-cat-${i}`}>
                                    <option>Web</option><option>Crypto</option><option>Reversing</option><option>Forensics</option><option>Network</option><option>OSINT</option>
                                </select>
                                <input type="number" value={c.points} onChange={(e) => updateCh(i, "points", e.target.value)}
                                    className="input-term !py-2" placeholder="pts" data-testid={`ch-pts-${i}`} />
                            </div>
                            <textarea value={c.prompt} onChange={(e) => updateCh(i, "prompt", e.target.value)}
                                className="input-term min-h-[50px]" placeholder="challenge prompt / description" data-testid={`ch-prompt-${i}`} />
                            <input value={c.flag} onChange={(e) => updateCh(i, "flag", e.target.value)}
                                className="input-term" placeholder="correct flag (kept secret)" data-testid={`ch-flag-${i}`} />
                            {challenges.length > 1 && (
                                <button type="button" onClick={() => removeCh(i)}
                                    className="absolute top-2 right-2 text-[#FF3B30] hover:text-white" data-testid={`remove-ch-${i}`}>
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={busy} className="btn-pink w-full" data-testid="hack-publish">
                {busy ? "launching..." : "$ ./launch_event"}
            </button>
        </form>
    );
}

// ============ ENDORSE FORM ============
function EndorseForm() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({ student_id: "", course_id: "", note: "" });
    const [busy, setBusy] = useState(false);
    const [mine, setMine] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        api.get("/leaderboard").then(r => setStudents(r.data || []));
        api.get("/courses").then(r => setCourses((r.data || []).filter(c => c.instructor_id === user?.id)));
        api.get(`/endorsements?instructor_id=${user?.id}`).then(r => setMine(r.data || [])).catch(() => { });
    }, [user?.id]);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.student_id || !form.note.trim()) return toast.error("Select a student and write a note");
        setBusy(true);
        try {
            await api.post("/endorsements", {
                student_id: form.student_id,
                note: form.note,
                course_id: form.course_id || null,
            });
            toast.success("Endorsement broadcast");
            setForm({ student_id: "", course_id: "", note: "" });
            const { data } = await api.get(`/endorsements?instructor_id=${user?.id}`);
            setMine(data || []);
        } catch (e) {
            toast.error(formatError(e.response?.data));
        } finally { setBusy(false); }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <form onSubmit={submit} className="card-term p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-[#FF2EA6]" />
                    <span className="term text-xs uppercase tracking-widest text-[#FF2EA6]">// endorse_talent</span>
                </div>
                <div>
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">select operative</label>
                    <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                        className="input-term" data-testid="endorse-student" required>
                        <option value="">— choose from top ranks —</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.rank} • {s.xp} XP)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">tied to course (optional)</label>
                    <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                        className="input-term" data-testid="endorse-course">
                        <option value="">— none —</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">endorsement note</label>
                    <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                        className="input-term min-h-[120px]" placeholder="What makes this operative exceptional? Recruiters read this."
                        required data-testid="endorse-note" />
                </div>
                <button type="submit" disabled={busy} className="btn-pink w-full" data-testid="endorse-submit">
                    {busy ? "transmitting..." : "$ ./endorse"}
                </button>
            </form>

            <div className="card-term p-5">
                <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3">// your_endorsements ({mine.length})</div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {mine.map(e => (
                        <div key={e.id} className="border-b border-[#333]/50 pb-3">
                            <div className="flex items-center justify-between">
                                <Link to={`/profile/${e.student_id}`} className="term text-xs text-[#FF2EA6] hover:underline">
                                    {e.student_name}
                                </Link>
                                <span className="term text-[10px] text-[#555]">{new Date(e.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-white mt-1">"{e.note}"</div>
                        </div>
                    ))}
                    {mine.length === 0 && <div className="term text-xs text-[#555]">// no endorsements yet</div>}
                </div>
            </div>
        </div>
    );
}
