import client from "./client";

export const getCustomerDashboard = () => client.get("/customer/dashboard");
export const getWishlist = () => client.get("/customer/wishlist");
export const toggleWishlist = (artworkId) => client.post(`/customer/wishlist/${artworkId}`);
export const getFollowing = () => client.get("/customer/following");
export const toggleFollow = (artistId) => client.post(`/customer/follow/${artistId}`);
export const updateCustomerProfile = (formData) => client.put("/customer/profile", formData);

export const getSellerApplication = () => client.get("/customer/seller-application");
export const submitSellerApplication = (formData) => client.post("/customer/seller-application", formData);
