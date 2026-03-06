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
  { name: "Maquillaje", tieneTalles: false, tieneColores: true, tieneMedidas: false },
  { name: "Blanquería", tieneTalles: false, tieneColores: true, tieneMedidas: true },
  { name: "Bazar", tieneTalles: false, tieneColores: true, tieneMedidas: true },
  { name: "Artículos de temporada", tieneTalles: false, tieneColores: true, tieneMedidas: true },
];

const SUBCATEGORIAS = {
  "Ropa de dama": ["Remeras y camisetas","Pantalones y jeans","Buzos y camperas","Shores y conjuntos","Otros"],
  "Ropa de hombre": ["Remeras y camisetas","Joggings y jeans","Buzos y camperas","Shores y conjuntos","Otros"],
  Calzados: ["Borcegos","Zapatillas de adultos","Zapatillas de niños","Ojotas y pantuflas","Sandalias"],
};

const AdminProductos = () => {

  const [productos, setProductos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imageUrl: "",
    imagePublicId: "",
    imagenes: [],
    estado: "activo",
    categoria: "",
    subcategoria: "",
    destacados: false,
    talles: "",
    colores: "",
    medidas: ""
  });

  const [editandoId, setEditandoId] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const productosPorPagina = 10;

  const token = localStorage.getItem("token");

  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const fetchProductos = async (page = 1, search = "") => {
    try {

      const res = await axios.get(
        `${API_BASE_URL}/products?page=${page}&limit=${productosPorPagina}&search=${search}`,
        config
      );

      setProductos(res.data.products || []);
      setPagina(res.data.currentPage || 1);
      setTotalPaginas(res.data.totalPages || 1);

    } catch (err) {
      console.error("Error fetching productos", err);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProductos(1, busqueda);
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setProducto(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const subirImagenCloudinary = async (file) => {

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return {
      url: res.data.secure_url,
      publicId: res.data.public_id
    };
  };

  const handleImagenChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    setSubiendoImagen(true);

    try {

      const img = await subirImagenCloudinary(file);

      setProducto(prev => {

        const nuevas = [...prev.imagenes, img];

        return {
          ...prev,
          imageUrl: prev.imageUrl || img.url,
          imagePublicId: prev.imagePublicId || img.publicId,
          imagenes: nuevas
        };

      });

    } catch (err) {

      console.error("Error subiendo imagen", err);

    } finally {

      setSubiendoImagen(false);

    }
  };

  const eliminarImagen = (index) => {

    setProducto(prev => {

      const nuevas = prev.imagenes.filter((_, i) => i !== index);

      return {
        ...prev,
        imagenes: nuevas,
        imageUrl: index === 0 ? nuevas[0]?.url || "" : prev.imageUrl,
        imagePublicId: index === 0 ? nuevas[0]?.publicId || "" : prev.imagePublicId
      };

    });
  };

  const guardarProducto = async () => {

    const precioFloat = parseFloat(
      producto.precio.toString().replace(/\./g, "").replace(",", ".")
    );

    const payload = {
      ...producto,
      precio: precioFloat
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
        imagenes: [],
        estado: "activo",
        categoria: "",
        subcategoria: "",
        destacados: false,
        talles: "",
        colores: "",
        medidas: ""
      });

      setEditandoId(null);

      fetchProductos(pagina, busqueda);

    } catch (err) {

      console.error("Error guardando producto", err);

    }
  };

  const editarProducto = (p) => {

    let imagenes = [];

    if (p.imageUrl) {
      imagenes.push({
        url: p.imageUrl,
        publicId: p.imagePublicId
      });
    }

    if (Array.isArray(p.imagenes)) {
      imagenes = [...imagenes, ...p.imagenes];
    }

    setProducto({
      ...p,
      imagenes,
      imageUrl: imagenes[0]?.url || "",
      imagePublicId: imagenes[0]?.publicId || ""
    });

    setEditandoId(p.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarProducto = async (id) => {

    try {

      await axios.delete(`${API_BASE_URL}/products/${id}`, config);

      fetchProductos(pagina, busqueda);

    } catch (err) {

      console.error("Error eliminando producto", err);

    }
  };

  const categoriaSeleccionada = CATEGORIAS.find(
    c => c.name === producto.categoria
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h2 className="text-2xl font-semibold mb-4">Panel de productos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <input
          name="nombre"
          value={producto.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="border p-2 rounded"
        />

        <input
          name="descripcion"
          value={producto.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
          className="border p-2 rounded"
        />

        <input
          name="precio"
          value={producto.precio}
          onChange={handleChange}
          placeholder="Precio"
          className="border p-2 rounded"
        />

        <div>

          <label className="bg-pink-200 px-3 py-2 rounded cursor-pointer block text-center">
            Cargar imagen
            <input
              type="file"
              onChange={handleImagenChange}
              className="hidden"
            />
          </label>

          {subiendoImagen && (
            <p className="text-xs mt-1">Subiendo...</p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">

            {producto.imagenes.map((img, i) => (

              <div key={i} className="relative">

                <img
                  src={img.url}
                  className="w-20 h-20 object-cover border rounded"
                />

                <button
                  onClick={() => eliminarImagen(i)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full"
                >
                  ✕
                </button>

              </div>

            ))}

          </div>

        </div>

        <select
          name="categoria"
          value={producto.categoria}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Categoría</option>

          {CATEGORIAS.map(c => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}

        </select>

        {SUBCATEGORIAS[producto.categoria] ? (

          <select
            name="subcategoria"
            value={producto.subcategoria}
            onChange={handleChange}
            className="border p-2 rounded"
          >

            <option value="">Subcategoría</option>

            {SUBCATEGORIAS[producto.categoria].map(sub => (
              <option key={sub}>{sub}</option>
            ))}

          </select>

        ) : (

          <input
            name="subcategoria"
            value={producto.subcategoria}
            onChange={handleChange}
            placeholder="Subcategoría"
            className="border p-2 rounded"
          />

        )}

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            name="destacados"
            checked={producto.destacados}
            onChange={handleChange}
          />

          Destacado

        </label>

        <select
          name="estado"
          value={producto.estado}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        {categoriaSeleccionada?.tieneTalles && (

          <input
            name="talles"
            value={producto.talles}
            onChange={handleChange}
            placeholder="Talles"
            className="border p-2 rounded"
          />

        )}

        {categoriaSeleccionada?.tieneColores && (

          <input
            name="colores"
            value={producto.colores}
            onChange={handleChange}
            placeholder="Colores"
            className="border p-2 rounded"
          />

        )}

        {categoriaSeleccionada?.tieneMedidas && (

          <input
            name="medidas"
            value={producto.medidas}
            onChange={handleChange}
            placeholder="Medidas"
            className="border p-2 rounded"
          />

        )}

      </div>

      <button
        onClick={guardarProducto}
        className="bg-pink-600 text-white px-6 py-2 rounded mb-8"
      >
        {editandoId ? "Guardar cambios" : "Crear producto"}
      </button>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar producto"
        className="border p-2 rounded w-full mb-6"
      />

      <div className="flex gap-4 overflow-x-auto">

        {Array.isArray(productos) &&
          productos.map(p => (

            <div
              key={p.id}
              className="min-w-[240px] border rounded p-3"
            >

              <img
                src={p.imageUrl}
                className="h-28 object-contain mx-auto mb-2"
              />

              <h3 className="font-semibold">
                {p.nombre}
              </h3>

              <p className="text-xs">
                {p.descripcion}
              </p>

              <p className="font-bold text-pink-600">
                ${Number(p.precio).toLocaleString("es-AR")}
              </p>

              <div className="flex gap-2 mt-2">

                <button
                  onClick={() => editarProducto(p)}
                  className="bg-pink-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarProducto(p.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>

              </div>

            </div>

          ))}

      </div>

      <div className="flex justify-center gap-4 mt-8">

        <button
          disabled={pagina === 1}
          onClick={() => fetchProductos(pagina - 1, busqueda)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button
          disabled={pagina === totalPaginas}
          onClick={() => fetchProductos(pagina + 1, busqueda)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Siguiente
        </button>

      </div>

    </div>
  );
};

export default AdminProductos;