import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatError } from "@/lib/api";
import { toast } from "sonner";
import { Upload as UploadIcon } from "lucide-react";

export default function UploadVideo() {
    const nav = useNavigate();
    const [mode, setMode] = useState("upload"); // "upload" | "url"
    const [form, setForm] = useState({
        title: "", description: "", video_type: "long", tags: "",
        external_url: "", thumbnail_url: ""
    });
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            let storage_path = null;
            if (mode === "upload") {
                if (!file) throw new Error("Please select a video file");
                const fd = new FormData();
                fd.append("file", file);
                const { data } = await api.post("/upload", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
                });
                storage_path = data.storage_path;
            }
            const payload = {
                title: form.title,
                description: form.description,
                video_type: form.video_type,
                tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
                external_url: mode === "url" ? form.external_url : null,
                storage_path,
                thumbnail_url: form.thumbnail_url || null,
            };
            const { data: v } = await api.post("/videos", payload);
            toast.success("uploaded()");
            nav(`/hub/${v.id}`);
        } catch (e) {
            toast.error(formatError(e.response?.data) || e.message);
        } finally { setBusy(false); }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10">
            <div className="card-term p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                    <UploadIcon className="h-5 w-5 text-[#00E5FF]" />
                    <span className="term text-xs uppercase tracking-widest text-[#00E5FF]">// content.upload</span>
                </div>
                <h1 className="text-2xl md:text-3xl term font-bold mb-6">Publish research</h1>
                <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setMode("upload")}
                        className={`term text-xs uppercase px-3 py-2 border ${mode === "upload" ? "border-[#00E5FF] text-[#00E5FF]" : "border-[#333] text-[#888]"}`}
                        data-testid="upload-mode-file">upload file</button>
                    <button type="button" onClick={() => setMode("url")}
                        className={`term text-xs uppercase px-3 py-2 border ${mode === "url" ? "border-[#00E5FF] text-[#00E5FF]" : "border-[#333] text-[#888]"}`}
                        data-testid="upload-mode-url">external url</button>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    {mode === "upload" ? (
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">video file</label>
                            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0])}
                                className="input-term" data-testid="upload-file-input" required />
                            {progress > 0 && progress < 100 && <div className="term text-xs text-[#00E5FF] mt-2">uploading: {progress}%</div>}
                        </div>
                    ) : (
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">embed url (YouTube/Vimeo)</label>
                            <input value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                                className="input-term" placeholder="https://www.youtube.com/embed/..." data-testid="upload-url-input" required />
                        </div>
                    )}
                    <div>
                        <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="input-term" required data-testid="upload-title-input" />
                    </div>
                    <div>
                        <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="input-term min-h-[100px]" data-testid="upload-desc-input" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">type</label>
                            <select value={form.video_type} onChange={(e) => setForm({ ...form, video_type: e.target.value })}
                                className="input-term" data-testid="upload-type-select">
                                <option value="long">Long-form</option>
                                <option value="short">Short (≤60s)</option>
                            </select>
                        </div>
                        <div>
                            <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">tags (comma-sep)</label>
                            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                className="input-term" placeholder="sqli, web, exploit" data-testid="upload-tags-input" />
                        </div>
                    </div>
                    <div>
                        <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">thumbnail url (optional)</label>
                        <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                            className="input-term" placeholder="https://..." data-testid="upload-thumb-input" />
                    </div>
                    <button type="submit" disabled={busy} className="btn-primary w-full" data-testid="upload-submit">
                        {busy ? "publishing..." : "$ ./publish"}
                    </button>
                </form>
            </div>
        </div>
    );
}
