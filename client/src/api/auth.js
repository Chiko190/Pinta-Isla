import client from "./client";

export const registerCustomer = (formData) =>
  client.post("/auth/register/customer", formData);

export const registerArtist = (formData) =>
  client.post("/auth/register/artist", formData);

export const login = (identifier, password) =>
  client.post("/auth/login", { identifier, password });

export const googleAuth = (credential, role) =>
  client.post("/auth/google", role ? { credential, role } : { credential });

export const forgotPassword = (email) => client.post("/auth/forgot-password", { email });

export const resetPassword = (payload) => client.post("/auth/reset-password", payload);
