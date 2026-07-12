import axios from "axios";

const BACKEND_URL = process.env.ORIGIN;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

// Add token from localStorage as fallback for cross-domain cookie issues
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("ht_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function formatError(data) {
    if (data == null) return "Something went wrong. Please try again.";
    if (data.error && typeof data.error === "string") return data.error;
    
    const detail = data.detail !== undefined ? data.detail : data;
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail
            .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
            .join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}

export default api;
