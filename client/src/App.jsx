import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileTabBar from "./components/layout/MobileTabBar";

import Home from "./pages/public/Home";
import Artworks from "./pages/public/Artworks";
import ArtworkDetail from "./pages/public/ArtworkDetail";
import Artists from "./pages/public/Artists";
import ArtistProfile from "./pages/public/ArtistProfile";
import Categories from "./pages/public/Categories";
import Login from "./pages/public/Login";
import RegisterChoice from "./pages/public/RegisterChoice";
import RegisterCustomer from "./pages/public/RegisterCustomer";
import RegisterArtist from "./pages/public/RegisterArtist";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Privacy from "./pages/public/Privacy";
import Terms from "./pages/public/Terms";
import Notifications from "./pages/public/Notifications";
import ComingSoonPage from "./pages/public/ComingSoonPage";
import NotFound from "./pages/public/NotFound";

import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerWishlist from "./pages/customer/Wishlist";
import CustomerFollowing from "./pages/customer/Following";
import CustomerProfileSettings from "./pages/customer/ProfileSettings";

import ArtistDashboard from "./pages/artist/Dashboard";
import MyArtworks from "./pages/artist/MyArtworks";
import ArtworkForm from "./pages/artist/ArtworkForm";
import ArtistProfileSettings from "./pages/artist/ProfileSettings";

import AdminDashboard from "./pages/admin/Dashboard";
import ArtistApplications from "./pages/admin/ArtistApplications";
import ArtworkModeration from "./pages/admin/ArtworkModeration";
import UserManagement from "./pages/admin/UserManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import AuditLog from "./pages/admin/AuditLog";

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col pb-14 lg:pb-0">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artworks" element={<Artworks />} />
            <Route path="/artworks/:id" element={<ArtworkDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistProfile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterChoice />} />
            <Route path="/register/customer" element={<RegisterCustomer />} />
            <Route path="/register/artist" element={<RegisterArtist />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Shared, functional across roles */}
            <Route element={<PrivateRoute />}>
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Explicit placeholders — not built yet, never faked */}
            <Route
              path="/commissions"
              element={<ComingSoonPage title="Custom Commissions" description="Requesting and managing custom paintings is coming soon." />}
            />
            <Route
              path="/messages"
              element={<ComingSoonPage title="Messaging" description="Direct messaging between customers and artists is coming soon." />}
            />
            <Route
              path="/orders"
              element={<ComingSoonPage title="Orders" description="Order history and tracking will appear here once checkout is connected." />}
            />
            <Route
              path="/cart"
              element={<ComingSoonPage title="Shopping Cart" description="Cart and checkout are still in development." />}
            />

            {/* Customer */}
            <Route element={<PrivateRoute roles={["customer"]} />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/wishlist" element={<CustomerWishlist />} />
              <Route path="/customer/following" element={<CustomerFollowing />} />
              <Route path="/customer/profile" element={<CustomerProfileSettings />} />
            </Route>

            {/* Artist */}
            <Route element={<PrivateRoute roles={["artist"]} />}>
              <Route path="/artist/dashboard" element={<ArtistDashboard />} />
              <Route path="/artist/artworks" element={<MyArtworks />} />
              <Route path="/artist/artworks/new" element={<ArtworkForm />} />
              <Route path="/artist/artworks/:id/edit" element={<ArtworkForm />} />
              <Route path="/artist/profile" element={<ArtistProfileSettings />} />
            </Route>

            {/* Admin */}
            <Route element={<PrivateRoute roles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/artist-applications" element={<ArtistApplications />} />
              <Route path="/admin/artworks" element={<ArtworkModeration />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/logs" element={<AuditLog />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileTabBar />
      </div>
    </AuthProvider>
  );
}
