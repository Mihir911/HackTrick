import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Briefcase, Search, Award, Zap, Users } from "lucide-react";

export default function Recruitment() {
    const [talent, setTalent] = useState([]);
    const [skill, setSkill] = useState("");
    const [minXp, setMinXp] = useState(0);

    useEffect(() => { load(); }, []);
    const load = async (params = {}) => {
        const q = new URLSearchParams();
        if (params.skill) q.set("skill", params.skill);
        if (params.min_xp) q.set("min_xp", params.min_xp);
        const { data } = await api.get(`/talent?${q}`);
        setTalent(data);
    };

    const applyFilters = (e) => {
        e.preventDefault();
        load({ skill: skill.trim(), min_xp: minXp });
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="mb-6">
                <div className="term text-[10px] uppercase tracking-[0.3em] text-[#00E5FF] mb-2">// recruitment.marketplace</div>
                <h1 className="text-3xl md:text-4xl term font-bold">Talent Database</h1>
                <p className="text-[#888] text-sm mt-2 max-w-xl">Filter operatives by skills and mission performance. All results are verified from real activity, not resumes.</p>
            </div>

            <form onSubmit={applyFilters} className="card-term p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">skill query</label>
                    <input value={skill} onChange={(e) => setSkill(e.target.value)}
                        className="input-term" placeholder="e.g. sqli, red-team, python" data-testid="talent-skill-input" />
                </div>
                <div>
                    <label className="term text-[10px] uppercase tracking-widest text-[#888] mb-1 block">min xp</label>
                    <input type="number" value={minXp} onChange={(e) => setMinXp(Number(e.target.value))}
                        className="input-term" data-testid="talent-xp-input" />
                </div>
                <div className="flex items-end">
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" data-testid="talent-search-btn">
                        <Search className="h-4 w-4" /> Query
                    </button>
                </div>
            </form>

            <div className="term text-[10px] uppercase tracking-widest text-[#555] mb-3 flex items-center gap-2">
                <Users className="h-3 w-3" /> {talent.length} candidates matched
            </div>

            <div className="border border-[#333]">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#333] term text-[10px] uppercase tracking-widest text-[#555] bg-[#0A0A0A]">
                    <div className="col-span-4">operative</div>
                    <div className="col-span-3 hidden md:block">skills</div>
                    <div className="col-span-1 text-right">xp</div>
                    <div className="col-span-2 hidden md:block">endorsements</div>
                    <div className="col-span-2 text-right">actions</div>
                </div>
                {talent.map(t => (
                    <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#333]/50 hover:bg-[#1A1A1A] transition items-center" data-testid={`talent-row-${t.id}`}>
                        <div className="col-span-4">
                            <div className="text-sm text-[#E0E0E0]">{t.name}</div>
                            <div className="term text-[10px] text-[#00E5FF] uppercase">{t.rank} • {t.role}</div>
                        </div>
                        <div className="col-span-3 hidden md:flex gap-1 flex-wrap">
                            {(t.skills || []).slice(0, 3).map(s => <span key={s} className="badge-term !text-[9px] !py-0.5">{s}</span>)}
                        </div>
                        <div className="col-span-1 text-right term text-[#FF2EA6] font-bold">{t.xp}</div>
                        <div className="col-span-2 hidden md:flex items-center gap-1 term text-xs text-[#00E5FF]">
                            <Award className="h-3 w-3" /> {t.endorsement_count || 0}
                        </div>
                        <div className="col-span-2 text-right">
                            <Link to={`/talent/${t.id}`} className="btn-ghost !py-1 !text-[10px]" data-testid={`talent-view-${t.id}`}>view profile</Link>
                        </div>
                    </div>
                ))}
                {talent.length === 0 && (
                    <div className="p-12 text-center term text-[#555]">// no matches</div>
                )}
            </div>
        </div>
    );
}
