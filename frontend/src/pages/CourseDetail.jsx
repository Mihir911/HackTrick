import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, PlayCircle, ArrowLeft, Star, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CourseDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [activeLesson, setActiveLesson] = useState(0);
    const isAuthed = user && user !== false;

    useEffect(() => {
        api.get(`/courses/${id}`).then(r => setCourse(r.data));
        if (isAuthed) {
            api.get("/enrollments/me").then(r => {
                setEnrolled(r.data.some(e => e.course_id === id));
            });
        }
    }, [id, isAuthed]);

    const enroll = async () => {
        if (!isAuthed) return toast.error("Login to enroll");
        await api.post(`/courses/${id}/enroll`);
        setEnrolled(true);
        toast.success("Enrolled. Welcome to the lab.");
    };

    if (!course) return <div className="p-8 term text-[#555] cursor-blink">loading</div>;

    const lesson = course.lessons[activeLesson];
    const canWatch = enrolled || course.is_free;

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
            <Link to="/academy" className="term text-xs text-[#888] hover:text-[#00E5FF] mb-4 inline-flex items-center gap-1" data-testid="course-back">
                <ArrowLeft className="h-3 w-3" /> back to academy
            </Link>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="card-term p-6 mb-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-[#FF2EA6]" />
                                <span className="term text-[10px] uppercase tracking-widest text-[#555]">{course.difficulty}</span>
                            </div>
                            {course.is_free
                                ? <span className="badge-term badge-yellow">FREEMIUM</span>
                                : <span className="badge-term">${course.price} USD</span>}
                        </div>
                        <h1 className="text-2xl md:text-3xl term font-bold mb-2">{course.title}</h1>
                        <p className="text-[#E0E0E0] text-sm leading-relaxed mb-4">{course.description}</p>
                        <div className="flex items-center gap-4 term text-xs text-[#888] uppercase mb-4">
                            <span>by <span className="text-[#00E5FF]">{course.instructor_name}</span></span>
                            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#FF2EA6]" /> {course.rating}</span>
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrollment_count}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                            {course.tags?.map(t => <span key={t} className="badge-term">{t}</span>)}
                        </div>
                        {!enrolled ? (
                            <button onClick={enroll} className="btn-primary" data-testid="course-enroll">
                                {course.is_free ? "$ ./enroll --free" : `$ ./enroll --pay $${course.price}`}
                            </button>
                        ) : (
                            <div className="badge-term inline-flex items-center gap-1 !text-xs !px-3 !py-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> ENROLLED
                            </div>
                        )}
                    </div>

                    {canWatch && lesson && (
                        <div className="card-term overflow-hidden">
                            <div className="aspect-video bg-black flex items-center justify-center">
                                <div className="text-center">
                                    <PlayCircle className="h-16 w-16 text-[#00E5FF] mx-auto mb-2 opacity-60" />
                                    <div className="term text-xs text-[#555] uppercase tracking-widest">lesson stream — {lesson.duration}</div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-[#333]">
                                <div className="term text-xs text-[#00E5FF] uppercase tracking-widest mb-1">Lesson {activeLesson + 1} of {course.lessons.length}</div>
                                <div className="text-lg term font-bold text-[#E0E0E0]">{lesson.title}</div>
                                {lesson.content && <p className="text-sm text-[#888] mt-2">{lesson.content}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div className="card-term p-4">
                        <div className="term text-xs uppercase tracking-widest text-[#00E5FF] mb-3">// curriculum</div>
                        <div className="space-y-1">
                            {course.lessons.map((l, i) => (
                                <button
                                    key={l.id}
                                    onClick={() => canWatch ? setActiveLesson(i) : toast.error("Enroll to unlock")}
                                    className={`w-full text-left p-3 border transition flex items-center gap-3 ${activeLesson === i && canWatch
                                            ? "border-[#00E5FF] bg-[#00E5FF]/5"
                                            : "border-[#333] hover:border-[#555]"
                                        }`}
                                    data-testid={`lesson-${i}`}
                                >
                                    <span className="term text-xs text-[#555] w-6">{String(i + 1).padStart(2, "0")}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-[#E0E0E0] truncate">{l.title}</div>
                                        <div className="term text-[10px] text-[#555] uppercase">{l.duration}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
