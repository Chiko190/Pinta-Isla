import client from "./client";

export const getCategories = () => client.get("/categories");

export const getArtworks = (params) => client.get("/artworks", { params });

export const getFeaturedArtworks = () => client.get("/artworks/featured");

export const getArtwork = (id) => client.get(`/artworks/${id}`);

export const getArtists = (params) => client.get("/artists", { params });

export const getFeaturedArtists = () => client.get("/artists/featured");

export const getArtistProfile = (id) => client.get(`/artists/${id}`);
