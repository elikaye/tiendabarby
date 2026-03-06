// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FavoritosProvider } from "./context/FavoritosContext";
import { FrontendSettingsProvider } from "./context/FrontendSettingsContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Destacados from "./components/Destacados";
import ProductosList from "./components/ProductosList";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";

import AdminDashboard from "./components/admin/AdminDashboard";
import Auth from "./components/admin/Auth";
import Register from "./components/admin/Register";

import DetalleProducto from "./components/DetalleProducto";
import Carrito from "./components/Carrito";
import FavoritosPage from "./pages/FavoritosPage";

import SearchResults from "./pages/SearchResults";

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import RopaDeDama from "./pages/RopaDeDama";
import RopaDeHombre from "./pages/RopaDeHombre";
import Calzados from "./pages/Calzados";
import Bazar from "./pages/Bazar";
import Maquillaje from "./pages/Maquillaje";
import Blanqueria from "./pages/Blanqueria";
import ArticulosDeTemporada from "./pages/ArticulosDeTemporada";

/* ===============================
   🔐 Ruta protegida Admin
================================ */
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.rol === "admin" ? children : <Navigate to="/auth" />;
};

/* ===============================
   📦 Contenido principal
================================ */
const AppContent = () => {
  return (
    <>
      <Navbar />

      <main className="flex-1 overflow-visible">
        <Routes>

          <Route
            path="/"
            element={
              <>
                <Hero />
                <Destacados />
                <ProductosList />
              </>
            }
          />

          <Route path="/search" element={<SearchResults />} />

          {/* ===============================
             ROPA DE DAMA
          =============================== */}
          <Route path="/ropa-dama" element={<RopaDeDama />} />
          <Route path="/ropa-dama/remeras-camisetas" element={<RopaDeDama />} />
          <Route path="/ropa-dama/pantalones-jean" element={<RopaDeDama />} />
          <Route path="/ropa-dama/buzos-camperas" element={<RopaDeDama />} />
          <Route path="/ropa-dama/shorts-conjuntos" element={<RopaDeDama />} />
          <Route path="/ropa-dama/otros" element={<RopaDeDama />} />

          {/* ===============================
             ROPA DE HOMBRE
          =============================== */}
          <Route path="/ropa-hombre" element={<RopaDeHombre />} />
          <Route path="/ropa-hombre/remeras-camisetas" element={<RopaDeHombre />} />
          <Route path="/ropa-hombre/joggins-jeans" element={<RopaDeHombre />} />
          <Route path="/ropa-hombre/buzos-camperas" element={<RopaDeHombre />} />
          <Route path="/ropa-hombre/shorts-conjuntos" element={<RopaDeHombre />} />
          <Route path="/ropa-hombre/otros" element={<RopaDeHombre />} />

          {/* ===============================
             CALZADOS
          =============================== */}
          <Route path="/calzados" element={<Calzados />} />
          <Route path="/calzados/borcegos" element={<Calzados />} />
          <Route path="/calzados/zapatillas-adultos" element={<Calzados />} />
          <Route path="/calzados/zapatillas-ninos" element={<Calzados />} />
          <Route path="/calzados/ojotas-pantuflas" element={<Calzados />} />
          <Route path="/calzados/sandalias" element={<Calzados />} />

          <Route path="/bazar" element={<Bazar />} />

          {/* NUEVAS CATEGORÍAS */}
          <Route path="/maquillaje" element={<Maquillaje />} />
          <Route path="/blanqueria" element={<Blanqueria />} />

          <Route
            path="/articulos-de-temporada"
            element={<ArticulosDeTemporada />}
          />

          <Route path="/producto/:id" element={<DetalleProducto />} />

          <Route path="/carrito" element={<Carrito />} />
          <Route path="/favoritos" element={<FavoritosPage />} />

          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route path="/ropa" element={<Navigate to="/ropa-dama" />} />

        </Routes>
      </main>
    </>
  );
};

/* ===============================
   🚀 App principal
================================ */
function App() {
  return (
    <AuthProvider>
      <FrontendSettingsProvider>
        <CartProvider>
          <SearchProvider>
            <FavoritosProvider>
              <Router>

                <ScrollToTop />

                <div className="font-sans text-black flex flex-col relative min-h-screen overflow-x-hidden">

                  <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-pink-100 via-white to-pink-200 bg-[length:300%_300%] animate-gradient" />

                  <AppContent />

                  <footer className="mt-auto">
                    <Footer />
                  </footer>

                  <WhatsAppButton />

                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    theme="colored"
                  />

                </div>

              </Router>
            </FavoritosProvider>
          </SearchProvider>
        </CartProvider>
      </FrontendSettingsProvider>
    </AuthProvider>
  );
}

export default App;