import { useEffect, useRef, useState } from "react";

export default function Terminal({ prompt, onSubmit, expectedHint, disabled }) {
    const [history, setHistory] = useState([
        { type: "sys", text: "HackTrick Terminal v1.0 (POSIX-like sandbox)" },
        { type: "sys", text: "type `help` for options, or paste your flag/payload below" },
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handle = async () => {
        if (!input.trim() || disabled) return;
        const cmd = input;
        setHistory((h) => [...h, { type: "in", text: cmd }]);
        setInput("");
        if (cmd.trim().toLowerCase() === "help") {
            setHistory((h) => [...h, { type: "out", text: "Commands: help, hint, clear, submit <flag>. Or type the flag directly and press Enter." }]);
            return;
        }
        if (cmd.trim().toLowerCase() === "clear") {
            setHistory([]);
            return;
        }
        if (cmd.trim().toLowerCase() === "hint") {
            setHistory((h) => [...h, { type: "out", text: expectedHint || "No additional hint available." }]);
            return;
        }
        const flag = cmd.trim().startsWith("submit ") ? cmd.trim().slice(7) : cmd.trim();
        const result = await onSubmit(flag);
        if (result?.correct) {
            setHistory((h) => [...h, { type: "success", text: `[+] FLAG ACCEPTED. +${result.xp_awarded || 0} XP` }]);
        } else {
            setHistory((h) => [...h, { type: "err", text: `[-] ${result?.message || "Incorrect. Try again."}` }]);
        }
    };

    return (
        <div className="border border-[#333] bg-[#050505] relative overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#333] bg-[#0A0A0A]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF3B30]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF2EA6]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#00E5FF]" />
                <div className="ml-2 term text-[10px] uppercase tracking-widest text-[#888]">hacktrick @ mission ~ #</div>
            </div>
            {prompt && (
                <div className="px-4 py-3 border-b border-[#333] term text-[13px] text-[#888] whitespace-pre-wrap">
                    {prompt}
                </div>
            )}
            <div ref={scrollRef} className="h-56 overflow-y-auto px-4 py-3 term text-[13px] leading-relaxed">
                {history.map((h, i) => (
                    <div key={i} className={
                        h.type === "in" ? "text-[#E0E0E0]" :
                            h.type === "sys" ? "text-[#555]" :
                                h.type === "out" ? "text-[#00E5FF]" :
                                    h.type === "success" ? "text-[#00E5FF] glow-primary" :
                                        "text-[#FF3B30]"
                    }>
                        {h.type === "in" && <span className="text-[#00E5FF]">$ </span>}
                        {h.text}
                    </div>
                ))}
            </div>
            <div className="flex items-center px-4 py-2 border-t border-[#333]">
                <span className="term text-[#00E5FF] mr-2">$</span>
                <input
                    ref={inputRef}
                    data-testid="terminal-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handle()}
                    disabled={disabled}
                    placeholder={disabled ? "mission solved" : "enter flag or type command..."}
                    className="flex-1 bg-transparent outline-none term text-[13px] text-[#E0E0E0]"
                    autoFocus
                />
                <button
                    onClick={handle}
                    disabled={disabled}
                    data-testid="terminal-submit"
                    className="btn-primary !py-1 !text-[10px]"
                >EXEC</button>
            </div>
        </div>
    );
}
