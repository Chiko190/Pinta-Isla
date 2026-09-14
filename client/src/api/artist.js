import client from "./client";

export const getArtistDashboard = () => client.get("/artist/dashboard");
export const getMyArtworks = () => client.get("/artist/artworks");
export const getMyArtwork = (id) => client.get(`/artist/artworks/${id}`);
export const createArtwork = (formData) => client.post("/artist/artworks", formData);
export const updateArtwork = (id, formData) => client.put(`/artist/artworks/${id}`, formData);
export const deleteArtwork = (id) => client.delete(`/artist/artworks/${id}`);
export const setArtworkStatus = (id, status) =>
  client.patch(`/artist/artworks/${id}/status`, { status });
export const getArtistProfileSettings = () => client.get("/artist/profile");
export const updateArtistProfile = (formData) => client.put("/artist/profile", formData);
