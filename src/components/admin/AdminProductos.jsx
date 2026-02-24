import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../config.jsx";

const CATEGORIAS = [
  { name: "Ropa de dama", tieneTalles: true, tieneColores: true, tieneMedidas: false },
  { name: "Ropa de hombre", tieneTalles: true, tieneColores: true, tieneMedidas: false },
  { name: "Calzados", tieneTalles: true, tieneColores: true, tieneMedidas: false },
  { name: "Bazar", tieneTalles: false, tieneColores: true, tieneMedidas: true },
  { name: "Artículos de temporada", tieneTalles: false, tieneColores: true, tieneMedidas: true },
];

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imageUrl: "",
    imagePublicId: "",
    estado: "activo", // <-- ya incluimos estado por defecto
    categoria: "",
    subcategoria: "",
    destacados: false,
    talles: "",
    colores: "",
    medidas: "",
  });

  const [editandoId, setEditandoId] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const productosPorPagina = 10;
  const token = localStorage.getItem("token");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // --- FETCH PRODUCTOS ---
  const fetchProductos = async (page = 1, search = "") => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/products?page=${page}&limit=${productosPorPagina}&search=${search}`,
        config
      );
      setProductos(res.data.products);
      setPagina(res.data.currentPage);
      setTotalPaginas(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching productos:", err.response?.data || err.message);
    }
  };

  useEffect(() => { fetchProductos(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchProductos(1, busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProducto((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- SUBIDA DE IMAGEN ---
  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      alert("Las variables de Cloudinary no están configuradas correctamente.");
      return;
    }

    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      if (res.data?.secure_url && res.data?.public_id) {
        setProducto((prev) => ({
          ...prev,
          imageUrl: res.data.secure_url,
          imagePublicId: res.data.public_id,
        }));
      } else {
        console.error("Respuesta Cloudinary incompleta:", res.data);
        alert("Error: Cloudinary no devolvió la URL de la imagen.");
      }
    } catch (err) {
      console.error("Error subiendo a Cloudinary:", err.response?.data || err.message);
      alert("Error subiendo imagen a Cloudinary. Revisá la consola para más info.");
    } finally {
      setSubiendoImagen(false);
    }
  };

  // --- GUARDAR PRODUCTO ---
  const guardarProducto = async () => {
    if (!token) {
      alert("No estás logueada. Por favor, inicia sesión.");
      return;
    }

    const precioFloat = Number(producto.precio.replace(/\./g, "").replace(",", "."));
    if (!precioFloat || precioFloat <= 0) {
      alert("Precio inválido");
      return;
    }

    const payload = {
      ...producto,
      precio: precioFloat,
      subcategoria: producto.subcategoria || null,
      talles: producto.talles || null,
      colores: producto.colores || null,
      medidas: producto.medidas || null,
    };

    try {
      if (editandoId) {
        await axios.put(`${API_BASE_URL}/products/${editandoId}`, payload, config);
      } else {
        await axios.post(`${API_BASE_URL}/products`, payload, config);
      }

      setProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        imageUrl: "",
        imagePublicId: "",
        estado: "activo",
        categoria: "",
        subcategoria: "",
        destacados: false,
        talles: "",
        colores: "",
        medidas: "",
      });
      setEditandoId(null);
      fetchProductos(pagina, busqueda);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("No tienes permisos para realizar esta acción (403).");
      } else {
        console.error("Error guardando producto:", err.response?.data || err.message);
        alert("Error guardando producto. Revisá la consola para más info.");
      }
    }
  };

  const editarProducto = (p) => {
    setProducto({
      ...p,
      precio: Math.trunc(Number(p.precio)).toString(),
      talles: p.talles || "",
      colores: p.colores || "",
      medidas: p.medidas || "",
      subcategoria: p.subcategoria || "",
    });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarProducto = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`, config);
      fetchProductos(pagina, busqueda);
    } catch (err) {
      console.error("Error eliminando producto:", err.response?.data || err.message);
      alert("Error eliminando producto. Revisá la consola para más info.");
    }
  };

  const categoriaSeleccionada = CATEGORIAS.find(c => c.name === producto.categoria);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Panel de productos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input name="nombre" value={producto.nombre} onChange={handleChange} placeholder="Nombre" className="border p-2 rounded" />
        <input name="descripcion" value={producto.descripcion} onChange={handleChange} placeholder="Descripción" className="border p-2 rounded" />
        <input name="precio" value={producto.precio} onChange={handleChange} placeholder="Precio" className="border p-2 rounded" />

        <div className="flex flex-col gap-2">
          <input type="file" onChange={handleImagenChange} />
          {subiendoImagen && <p className="text-xs text-gray-500">Subiendo imagen...</p>}
          {producto.imageUrl && <img src={producto.imageUrl} className="h-24 object-contain border rounded p-1" />}
        </div>

        <select name="categoria" value={producto.categoria} onChange={handleChange} className="border p-2 rounded">
          <option value="">Categoría</option>
          {CATEGORIAS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        <input name="subcategoria" value={producto.subcategoria} onChange={handleChange} placeholder="Subcategoría" className="border p-2 rounded" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="destacados" checked={producto.destacados} onChange={handleChange} />
          Destacado
        </label>

        {/* NUEVO SELECT PARA ESTADO */}
        <select name="estado" value={producto.estado} onChange={handleChange} className="border p-6 rounded">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        {categoriaSeleccionada?.tieneTalles && <input name="talles" value={producto.talles} onChange={handleChange} placeholder="Talles" className="border p-2 rounded" />}
        {categoriaSeleccionada?.tieneColores && <input name="colores" value={producto.colores} onChange={handleChange} placeholder="Colores" className="border p-2 rounded" />}
        {categoriaSeleccionada?.tieneMedidas && <input name="medidas" value={producto.medidas} onChange={handleChange} placeholder="Medidas" className="border p-2 rounded" />}
      </div>

      <button onClick={guardarProducto} className="bg-pink-600 text-white px-6 py-2 rounded mb-8">
        {editandoId ? "Guardar cambios" : "Crear producto"}
      </button>

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar producto..." className="border p-2 rounded w-full mb-6" />

      <div className="flex gap-4 overflow-x-auto">
        {productos.map(p => (
          <div key={p.id} className="min-w-[240px] border rounded p-3 text-sm">
            <img src={p.imageUrl} className="h-28 object-contain mx-auto mb-2" />
            <h3 className="font-semibold">{p.nombre}</h3>
            <p className="text-xs">{p.descripcion}</p>
            <p className="font-bold text-pink-600">${Number(p.precio).toLocaleString("es-AR")}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => editarProducto(p)} className="bg-pink-500 text-white px-3 py-1 rounded">Editar</button>
              <button onClick={() => eliminarProducto(p.id)} className="bg-red-600 text-white px-3 py-1 rounded">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={pagina === 1} onClick={() => fetchProductos(pagina - 1, busqueda)}>Anterior</button>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button key={i} onClick={() => fetchProductos(i + 1, busqueda)} className={pagina === i + 1 ? "font-bold underline" : ""}>{i + 1}</button>
          ))}
          <button disabled={pagina === totalPaginas} onClick={() => fetchProductos(pagina + 1, busqueda)}>Siguiente</button>
        </div>
      )}
    </div>
  );
};

export default AdminProductos;
