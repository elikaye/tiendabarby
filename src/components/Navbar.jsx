import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { LayoutDashboard, Heart, Search } from "lucide-react";

import { useCart } from "../context/CartContext";
import { useSearch } from "../context/SearchContext";
import { useFavoritos } from "../context/FavoritosContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localQuery, setLocalQuery] = useState("");

  const { carrito } = useCart();
  const { favoritos } = useFavoritos();
  const { setQuery } = useSearch();
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const secciones = [
    ["Inicio", "/"],
    ["Ropa de dama", "/ropa-dama"],
    ["Ropa de hombre", "/ropa-hombre"],
    ["Calzados", "/calzados"],
    ["Bazar", "/bazar"],
    ["Artículos de temporada", "/articulos-de-temporada"],
  ];

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = localQuery.trim();
    setQuery(q);

    setShowSearch(false);
    setMenuOpen(false);

    if (!q) {
      navigate("/"); // Si está vacío, ir a inicio
    } else {
      navigate("/search"); // Sino, ir a resultados
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
        {/* MENÚ DESKTOP */}
        <nav className="hidden md:flex gap-8 font-bold text-sm">
          {secciones.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 transition ${
                  isActive
                    ? "text-pink-500"
                    : "text-black hover:text-pink-500"
                }`
              }
            >
              <span className="w-2 h-2 rounded-full bg-black" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ICONOS */}
        <div className="flex items-center gap-4 relative md:justify-end w-full md:w-auto">
          {/* HAMBURGUESA */}
          <button
            className="md:hidden text-xl text-black mr-auto"
            onClick={() => {
              setMenuOpen(!menuOpen);
              setShowSearch(false);
            }}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* BUSCADOR */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              size={22}
              onClick={() => setShowSearch(!showSearch)}
              className="cursor-pointer text-black hover:text-pink-500"
            />
            {showSearch && (
              <input
                type="text"
                placeholder="Buscar..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit(e);
                }}
                className="absolute top-full mt-2 right-0 w-44 px-3 py-1 rounded text-sm shadow-md focus:outline-none z-50"
                autoFocus
              />
            )}
          </form>

          {/* FAVORITOS */}
          <NavLink to="/favoritos" className="relative text-xl text-black">
            <Heart className="hover:text-pink-500" />
            {favoritos.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {favoritos.length}
              </span>
            )}
          </NavLink>

          {/* CARRITO */}
          <NavLink to="/carrito" className="relative text-xl text-black">
            <FaShoppingCart className="hover:text-pink-500" />
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {carrito.length}
              </span>
            )}
          </NavLink>

          {/* ADMIN */}
          {user?.rol === "admin" && (
            <button onClick={() => navigate("/admin")}>
              <LayoutDashboard className="text-black hover:text-pink-500" />
            </button>
          )}

          {/* LOGIN / LOGOUT */}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-black hover:text-pink-500"
            >
              Cerrar<br />sesión
            </button>
          ) : (
            <Link to="/auth">
              <FaUserCircle className="text-xl text-black hover:text-pink-500" />
            </Link>
          )}
        </div>
      </div>

      {/* MENÚ MOBILE */}
      {menuOpen && (
        <nav className="md:hidden bg-black/10 backdrop-blur-md px-6 py-4 flex flex-col gap-4 text-white font-bold">
          {secciones.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 hover:text-pink-500"
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Navbar;