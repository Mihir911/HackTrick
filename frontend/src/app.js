import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import ContentHub from "@/pages/ContentHub";
import VideoDetail from "@/pages/VideoDetail";
import UploadVideo from "@/pages/UploadVideo";
import Academy from "@/pages/Academy";
import CourseDetail from "@/pages/CourseDetail";
import HackTheCity from "@/pages/HackTheCity";
import Recruitment from "@/pages/Recruitment";
import TalentDetail from "@/pages/TalentDetail";
import Hackathons from "@/pages/Hackathons";
import HackathonDetail from "@/pages/HackathonDetail";
import Profile from "@/pages/Profile";
import Studio from "@/pages/Studio";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    theme="dark"
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "#121212",
                            border: "1px solid #333",
                            color: "#E0E0E0",
                            fontFamily: "JetBrains Mono, monospace",
                            borderRadius: "2px",
                        },
                    }}
                />
                <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0]">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/hub" element={<ContentHub />} />
                        <Route path="/hub/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
                        <Route path="/hub/:id" element={<VideoDetail />} />
                        <Route path="/academy" element={<Academy />} />
                        <Route path="/academy/:id" element={<CourseDetail />} />
                        <Route path="/city" element={<ProtectedRoute><HackTheCity /></ProtectedRoute>} />
                        <Route path="/talent" element={<ProtectedRoute roles={["hr"]}><Recruitment /></ProtectedRoute>} />
                        <Route path="/talent/:id" element={<ProtectedRoute roles={["hr"]}><TalentDetail /></ProtectedRoute>} />
                        <Route path="/hackathons" element={<Hackathons />} />
                        <Route path="/hackathons/:id" element={<ProtectedRoute><HackathonDetail /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/studio" element={<ProtectedRoute roles={["instructor"]}><Studio /></ProtectedRoute>} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
