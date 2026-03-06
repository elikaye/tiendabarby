import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingBag } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useFavoritos } from "../context/FavoritosContext";
import { toast } from "react-toastify";
import { API_BASE_URL, CLOUDINARY_BASE_URL } from "../config";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { carrito, agregarAlCarrito, eliminarDelCarrito } = useCart();
  const { favoritos, agregarFavorito, eliminarFavorito } = useFavoritos();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFav, setLoadingFav] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [talleSeleccionado, setTalleSeleccionado] = useState("");
  const [imagenActiva, setImagenActiva] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error("Error cargando producto");
        const data = await res.json();
        console.log("📦 Producto recibido de API:", data);
        setProducto(data);
        setImagenActiva(data.imageUrl);
      } catch (err) {
        console.error("❌ Error fetchProducto:", err);
        toast.error("No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    fetchProducto();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-16 text-gray-500">Cargando producto…</div>
    );

  if (!producto)
    return (
      <div className="text-center py-16 text-gray-500">Producto no encontrado</div>
    );

  const parseColores = (colores) => {
    if (!colores) return [];
    if (Array.isArray(colores)) return colores;
    return colores
      .replace(/\s+y\s+/g, ",")
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);
  };

  const parseTalles = (talles) => {
    if (!talles) return [];
    if (Array.isArray(talles)) return talles;
    return talles
      .replace(/Talles\s*\(|\)/gi, "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
  };

  const coloresArray = parseColores(producto.colores);
  const tallesArray = parseTalles(producto.talles);

  const favoritosArray = Array.isArray(favoritos) ? favoritos : [];
  const isFavorito = favoritosArray.some(
    (f) => (f?.producto_id || f?.id)?.toString() === producto.id?.toString()
  );

  const toggleFavorito = async () => {
    if (!token) {
      toast.info("Iniciá sesión para agregar a favoritos", { autoClose: 1500 });
      return;
    }
    if (loadingFav) return;
    setLoadingFav(true);
    try {
      isFavorito
        ? await eliminarFavorito(producto.id)
        : await agregarFavorito(producto);
    } catch {
      toast.error("No se pudo actualizar favoritos");
    } finally {
      setLoadingFav(false);
    }
  };

  const carritoArray = Array.isArray(carrito) ? carrito : [];
  const isInCart = carritoArray.some(
    (item) => (item.producto_id || item.id)?.toString() === producto.id?.toString()
  );

  const handleAgregarAlCarrito = async () => {
    if (!token) {
      toast.info("Iniciá sesión para poder comprar", { autoClose: 1500 });
      return;
    }
    if (!colorSeleccionado && coloresArray.length > 0) {
      toast.info("Por favor, seleccioná un color", { autoClose: 2000 });
      return;
    }
    if (!talleSeleccionado && tallesArray.length > 0) {
      toast.info("Por favor, seleccioná un talle", { autoClose: 2000 });
      return;
    }
    if (addingCart || producto.estado !== "activo") return;

    try {
      setAddingCart(true);
      const productoParaCarrito = {
        ...producto,
        color: colorSeleccionado || null,
        talle: talleSeleccionado || null,
      };
      if (isInCart) {
        await eliminarDelCarrito(producto.id);
        toast.info(`${producto.nombre} eliminado del carrito`, { autoClose: 1500 });
      } else {
        await agregarAlCarrito(productoParaCarrito, 1);
        toast.success(`${producto.nombre} agregado al carrito`, { autoClose: 1500 });
      }
    } catch (err) {
      console.error("❌ Error agregando al carrito:", err);
      toast.error("No se pudo actualizar el carrito");
    } finally {
      setAddingCart(false);
    }
  };

  const imgSrc = producto.imageUrl
    ? producto.imageUrl.startsWith("http")
      ? producto.imageUrl
      : `${CLOUDINARY_BASE_URL}${producto.imageUrl}`
    : "/placeholder.png";

  // 🔹 Aquí está la corrección: usamos `producto.imagenes` para el carrusel
  const imagenesProducto = [
    producto.imageUrl,
    ...(producto.imagenes || []),
  ].filter(Boolean);

  const productoInactivo = producto.estado !== "activo";

  return (
    <div className="bg-white px-3 py-6 md:px-20 md:py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg md:shadow-lg p-4 md:p-8 relative">

        <button
          onClick={toggleFavorito}
          disabled={loadingFav}
          className={`absolute top-3 right-3 text-2xl md:text-3xl ${
            isFavorito ? "text-pink-600" : "text-black hover:text-pink-600"
          }`}
        >
          <FaHeart />
        </button>

        <h2 className="text-xl md:text-3xl font-body mb-4 text-center">
          {producto.nombre}
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">

          {/* GALERIA */}
          <div className="flex flex-col items-center gap-3">

            <img
              src={imagenActiva || imgSrc}
              alt={producto.nombre}
              className="w-full max-w-[220px] md:max-w-xs h-56 md:h-80 object-contain rounded-lg"
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            />

            {imagenesProducto.length > 1 && (
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={10}
                slidesPerView={4}
                className="w-[220px] md:w-[260px]"
              >
                {imagenesProducto.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={img}
                      onClick={() => setImagenActiva(img)}
                      className={`h-16 w-full object-contain border rounded cursor-pointer ${
                        imagenActiva === img ? "border-pink-500" : "border-gray-300"
                      }`}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* DETALLES */}
          <div className="flex flex-col gap-3 w-full text-center md:text-left">

            {productoInactivo && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
                ❌ Producto sin stock
              </div>
            )}

            {producto.descripcion && (
              <p className="text-gray-700">{producto.descripcion}</p>
            )}

            {coloresArray.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Elegí un color:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={colorSeleccionado}
                  onChange={(e) => setColorSeleccionado(e.target.value)}
                >
                  <option value="">--Seleccionar--</option>
                  {coloresArray.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {tallesArray.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Elegí un talle:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={talleSeleccionado}
                  onChange={(e) => setTalleSeleccionado(e.target.value)}
                >
                  <option value="">--Seleccionar--</option>
                  {tallesArray.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-2xl font-body text-pink-600 mt-2">
              ${new Intl.NumberFormat("es-AR").format(producto.precio)}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleAgregarAlCarrito}
                disabled={addingCart || productoInactivo}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-black transition flex items-center justify-center gap-2"
              >
                <FaShoppingBag />
                {isInCart ? "Quitar del carrito" : "Agregar al carrito"}
              </button>

              <button
                onClick={() => navigate("/")}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-black transition"
              >
                Seguir comprando
              </button>
            </div>

            {(coloresArray.length > 0 || tallesArray.length > 0) && (
              <p className="text-xs italic mt-1 text-gray-500">
                ✅ La clienta confirmará stock y disponibilidad del color/talle seleccionado.
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;