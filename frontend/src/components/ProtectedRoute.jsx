import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="term text-[#00E5FF] cursor-blink">initializing session</div>
            </div>
        );
    }
    if (!user || user === false) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role) && user.role !== "admin") {
        return (
            <div className="min-h-[60vh] flex items-center justify-center flex-col gap-2 px-6 text-center">
                <div className="term text-[#FF3B30] text-lg">$ access denied</div>
                <div className="text-[#888] text-sm">This module requires role: {roles.join(", ")}</div>
            </div>
        );
    }
    return children;
}
