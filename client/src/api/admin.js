import client from "./client";

export const getAdminStats = () => client.get("/admin/stats");

export const getArtistApplications = (status) =>
  client.get("/admin/artist-applications", { params: { status } });
export const approveArtist = (userId) => client.post(`/admin/artist-applications/${userId}/approve`);
export const rejectArtist = (userId, reason) =>
  client.post(`/admin/artist-applications/${userId}/reject`, { reason });

export const getAdminArtworks = (status) => client.get("/admin/artworks", { params: { status } });
export const approveArtwork = (id) => client.post(`/admin/artworks/${id}/approve`);
export const rejectArtwork = (id, reason) => client.post(`/admin/artworks/${id}/reject`, { reason });
export const hideArtwork = (id) => client.patch(`/admin/artworks/${id}/hide`);
export const deleteArtworkAdmin = (id) => client.delete(`/admin/artworks/${id}`);
export const verifyArtist = (id) => client.patch(`/admin/artists/${id}/verify`);

export const getUsers = (params) => client.get("/admin/users", { params });
export const suspendUser = (id) => client.patch(`/admin/users/${id}/suspend`);
export const restoreUser = (id) => client.patch(`/admin/users/${id}/restore`);

export const getAdminCategories = () => client.get("/admin/categories");
export const createCategory = (payload) => client.post("/admin/categories", payload);
export const updateCategory = (id, payload) => client.put(`/admin/categories/${id}`, payload);
export const deleteCategory = (id) => client.delete(`/admin/categories/${id}`);

export const getAuditLogs = () => client.get("/admin/logs");
