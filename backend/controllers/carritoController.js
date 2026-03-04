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

// 🔹 Generar clave única por variante
const generarKey = (p) =>
  `${p.id}-${p.color || "sincolor"}-${p.talle || "sintalle"}`;

// 📦 Obtener carrito
export const getCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const carrito = await Carrito.findOne({ where: { user_id: userId } });
    if (!carrito) return res.json({ productos: [] });

    const productos = parseArray(carrito.productos);

    // 🔥 regeneramos uniqueKey al devolver
    const productosConKey = productos.map((p) => ({
      ...p,
      uniqueKey: generarKey(p),
    }));

    res.json({ productos: productosConKey });
  } catch (error) {
    console.error("❌ Error en getCarrito:", error);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
};

// 🛒 Agregar producto respetando talle y color
export const addCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const { producto } = req.body;
    if (!producto || !producto.id)
      return res.status(400).json({ error: "Producto inválido" });

    const cantidad = Number(producto.cantidad || 1);

    const productoDB = await Producto.findByPk(producto.id);
    if (!productoDB)
      return res.status(404).json({ error: "Producto no encontrado" });

    const productoNormalizado = {
      id: productoDB.id,
      nombre: productoDB.nombre,
      precio: productoDB.precio,
      imageUrl: productoDB.imageUrl,
      cantidad,
      talle: producto.talle || null, // ✅ talle elegido
      color: producto.color || null, // ✅ color elegido
    };

    productoNormalizado.uniqueKey = generarKey(productoNormalizado);

    let carrito = await Carrito.findOne({ where: { user_id: userId } });

    if (!carrito) {
      carrito = await Carrito.create({
        user_id: userId,
        productos: JSON.stringify([productoNormalizado]),
      });
    } else {
      const productosActuales = parseArray(carrito.productos);

      const index = productosActuales.findIndex(
        (p) =>
          p.id.toString() === productoNormalizado.id.toString() &&
          p.talle === productoNormalizado.talle &&
          p.color === productoNormalizado.color
      );

      if (index !== -1) {
        productosActuales[index].cantidad += cantidad;
      } else {
        productosActuales.push(productoNormalizado);
      }

      carrito.productos = JSON.stringify(productosActuales);
      await carrito.save();
    }

    const productosFinal = parseArray(carrito.productos).map((p) => ({
      ...p,
      uniqueKey: generarKey(p),
    }));

    res.json({ productos: productosFinal });
  } catch (error) {
    console.error("❌ Error en addCarrito:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
};

// ❌ Eliminar producto por variante (uniqueKey)
export const removeCarrito = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const { uniqueKey } = req.body;
    if (!uniqueKey)
      return res.status(400).json({ error: "uniqueKey requerido" });

    const carrito = await Carrito.findOne({ where: { user_id: userId } });
    if (!carrito) return res.json({ productos: [] });

    const productosActuales = parseArray(carrito.productos).filter(
      (p) => generarKey(p) !== uniqueKey
    );

    carrito.productos = JSON.stringify(productosActuales);
    await carrito.save();

    const productosFinal = productosActuales.map((p) => ({
      ...p,
      uniqueKey: generarKey(p),
    }));

    res.json({ productos: productosFinal });
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