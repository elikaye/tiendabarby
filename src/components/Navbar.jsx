import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const [activeSection, setActiveSection] = useState("/");
  const [hovered, setHovered] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(null);

  const { carrito } = useCart();
  const { favoritos } = useFavoritos();
  const { setQuery } = useSearch();
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const secciones = [
    ["Inicio", "/"],
    ["Ropa de dama", "/ropa-dama"],
    ["Ropa de hombre", "/ropa-hombre"],
    ["Calzados", "/calzados"],
    ["Bazar", "/bazar"],
    ["Maquillaje", "/maquillaje"],
    ["Blanquería", "/blanqueria"],
    ["Artículos de temporada", "/articulos-de-temporada"],
  ];

  const subcategorias = {
    "/ropa-dama": [
      "Remeras y camisetas",
      "Pantalones y jeans",
      "Buzos y camperas",
      "Shores y conjuntos",
      "Otros",
    ],
    "/ropa-hombre": [
      "Remeras y camisetas",
      "Joggins y jeans",
      "Buzos y camperas",
      "Shores y conjuntos",
      "Otros",
    ],
    "/calzados": [
      "Borcegos",
      "Zapatillas de adultos",
      "Zapatillas de niños",
      "Ojotas y pantuflas",
      "Sandalias",
    ],
  };

  useEffect(() => {
    setActiveSection(location.pathname);
  }, [location.pathname]);

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
    if (!q) navigate("/");
    else navigate("/search");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-pink-500/70 backdrop-blur-md shadow-md text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
        {/* MENÚ DESKTOP */}
        <nav className="hidden md:flex gap-8 font-bold text-sm relative">
          {secciones.map(([label, to]) => (
            <div
              key={to}
              onMouseEnter={() => setHovered(to)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex flex-col items-start"
            >
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 transition ${
                    isActive ? "text-white" : "text-white hover:text-pink-300"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                {label}
              </NavLink>

              {hovered === to && subcategorias[to] && (
                <div className="absolute top-full left-0 pt-2 bg-pink-500/80 shadow-lg rounded-md py-2 px-4 z-50 min-w-[220px]">
                  {subcategorias[to].map((sub) => (
                    <Link
                      key={sub}
                      to={`${to}?subcategoria=${encodeURIComponent(sub)}`}
                      className="block px-2 py-1 text-sm text-white hover:bg-pink-600 rounded"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ICONOS */}
        <div className="flex items-center gap-4 relative md:justify-end w-full md:w-auto">
          {/* HAMBURGUESA */}
          <button
            className="md:hidden text-xl text-white mr-auto"
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
              className="cursor-pointer text-white hover:text-pink-300"
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
                className="absolute top-full mt-2 right-0 w-44 px-3 py-1 rounded text-sm shadow-md focus:outline-none z-50 text-black"
                autoFocus
              />
            )}
          </form>

          {/* FAVORITOS */}
          <NavLink to="/favoritos" className="relative text-xl text-white">
            <Heart className="hover:text-pink-300" />
            {favoritos.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-300 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {favoritos.length}
              </span>
            )}
          </NavLink>

          {/* CARRITO */}
          <NavLink to="/carrito" className="relative text-xl text-white">
            <FaShoppingCart className="hover:text-pink-300" />
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-300 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {carrito.length}
              </span>
            )}
          </NavLink>

          {/* ADMIN */}
          {user?.rol === "admin" && (
            <button onClick={() => navigate("/admin")}>
              <LayoutDashboard className="text-white hover:text-pink-300" />
            </button>
          )}

          {/* LOGIN / LOGOUT */}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-white hover:text-pink-300"
            >
              Cerrar
              <br />
              sesión
            </button>
          ) : (
            <Link to="/auth">
              <FaUserCircle className="text-xl text-white hover:text-pink-300" />
            </Link>
          )}
        </div>
      </div>

      {/* MENÚ MOBILE */}
      {menuOpen && (
        <nav className="md:hidden bg-pink-500/70 backdrop-blur-md px-6 py-4 flex flex-col gap-3 font-bold text-white">
          {secciones.map(([label, to]) => (
            <div key={to} className="flex flex-col">
              <div
                className={`flex items-center justify-between cursor-pointer ${
                  activeSection === to ? "text-white" : "text-white"
                }`}
                onClick={() => {
                  if (subcategorias[to]) {
                    setMobileOpen(mobileOpen === to ? null : to);
                  } else {
                    navigate(to);
                    setMenuOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeSection === to ? "bg-white" : "bg-white"
                    }`}
                  />
                  {label}
                </div>
                {subcategorias[to] && (
                  <span className="text-xs">{mobileOpen === to ? "−" : "+"}</span>
                )}
              </div>

              {subcategorias[to] && mobileOpen === to && (
                <div className="flex flex-col pl-5 mt-1 gap-1">
                  {subcategorias[to].map((sub) => (
                    <Link
                      key={sub}
                      to={`${to}?subcategoria=${encodeURIComponent(sub)}`}
                      className="text-sm text-white hover:text-pink-300"
                      onClick={() => setMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Navbar;