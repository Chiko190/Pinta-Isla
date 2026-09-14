import axios from "axios";

const client = axios.create({ baseURL: "/api" });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("pinta_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onSessionExpired = null;
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && onSessionExpired) {
      onSessionExpired();
    }
    const message =
      err.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject({ ...err, message });
  }
);

export default client;
