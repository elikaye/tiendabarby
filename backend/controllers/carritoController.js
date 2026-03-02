import Carrito from "../models/carrito.js";
import Producto from "../models/product.js";

// 🔹 Asegurar array siempre
const parseArray = (data) => {
  if (!data) return [];
  try {
    return Array.isArray(data) ? data : JSON.parse(data);
  } catch {
    return [];
  }
};

// 📦 Obtener carrito
export const getCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const carrito = await Carrito.findOne({ where: { user_id: userId } });
    if (!carrito) return res.json({ productos: [] });

    res.json({ productos: parseArray(carrito.productos) });
  } catch (error) {
    console.error("❌ Error en getCarrito:", error);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
};

// 🛒 Agregar producto al carrito con talle y color
export const addCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const { producto } = req.body;
    if (!producto || !producto.id)
      return res.status(400).json({ error: "Producto inválido" });

    const cantidad = Number(producto.cantidad || 1);

    // 🔹 Traer el producto completo de la base
    const productoDB = await Producto.findByPk(producto.id);
    if (!productoDB)
      return res.status(404).json({ error: "Producto no encontrado" });

    // 🔹 Normalizar producto incluyendo talle y color
    // Convertimos colores y talles a arrays (si son strings, separarlos)
    const coloresArray = productoDB.colores
      ? productoDB.colores.split(",").map(c => c.trim())
      : [];
    const tallesArray = productoDB.talles
      ? productoDB.talles.replace(/Talles\s*\(/, "").replace(/\)/, "").split(",").map(t => t.trim())
      : [];

    const productoNormalizado = {
      id: productoDB.id,
      nombre: productoDB.nombre,
      precio: productoDB.precio,
      imageUrl: productoDB.imageUrl,
      cantidad,
      talles: tallesArray, // Ahora es un array
      colores: coloresArray, // Ahora es un array
    };

    let carrito = await Carrito.findOne({ where: { user_id: userId } });

    if (!carrito) {
      carrito = await Carrito.create({
        user_id: userId,
        productos: JSON.stringify([productoNormalizado]),
      });
    } else {
      const productosActuales = parseArray(carrito.productos);

      const index = productosActuales.findIndex(
        (p) => p.id.toString() === productoNormalizado.id.toString()
      );

      if (index !== -1) {
        productosActuales[index].cantidad += cantidad;
      } else {
        productosActuales.push(productoNormalizado);
      }

      carrito.productos = JSON.stringify(productosActuales);
      await carrito.save();
    }

    res.json({ productos: parseArray(carrito.productos) });
  } catch (error) {
    console.error("❌ Error en addCarrito:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
};

// ❌ Eliminar producto del carrito
export const removeCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const { productoId } = req.body;
    if (!productoId)
      return res.status(400).json({ error: "productoId requerido" });

    const carrito = await Carrito.findOne({ where: { user_id: userId } });
    if (!carrito) return res.json({ productos: [] });

    const productosActuales = parseArray(carrito.productos).filter(
      (p) => p.id.toString() !== productoId.toString()
    );

    carrito.productos = JSON.stringify(productosActuales);
    await carrito.save();

    res.json({ productos: productosActuales });
  } catch (error) {
    console.error("❌ Error en removeCarrito:", error);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
};

// 🗑️ Vaciar carrito
export const clearCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const carrito = await Carrito.findOne({ where: { user_id: userId } });
    if (carrito) {
      carrito.productos = JSON.stringify([]);
      await carrito.save();
    }

    res.json({ productos: [] });
  } catch (error) {
    console.error("❌ Error en clearCarrito:", error);
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
};