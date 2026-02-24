import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// ✅ Unificado con tu variable real
const API =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// 🔹 normaliza productos para evitar duplicados
const normalizarCarrito = (productos = []) => {
  const map = new Map();

  productos.forEach((p) => {
    if (!p || !p.id) return;

    const id = p.id;
    const cantidad = Number(p.cantidad || 1);

    if (map.has(id)) {
      map.get(id).cantidad += cantidad;
    } else {
      map.set(id, { ...p, cantidad });
    }
  });

  return Array.from(map.values());
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingIds, setSyncingIds] = useState([]);

  const headersWithAuth = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  // 🔹 cargar carrito
  useEffect(() => {
    if (!user || !token) {
      setCarrito([]);
      return;
    }

    const loadCarrito = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/carrito`, {
          headers: headersWithAuth(),
        });

        if (!res.ok) throw new Error("Error cargando carrito");

        const data = await res.json();
        setCarrito(normalizarCarrito(data?.productos || []));
      } catch (err) {
        console.error("❌ Error cargando carrito:", err);
        setCarrito([]);
      } finally {
        setLoading(false);
      }
    };

    loadCarrito();
  }, [user, token]);

  // 🔹 agregar producto
  const agregarAlCarrito = async (producto, cantidad = 1) => {
    if (!token || !producto?.id) return;

    // Optimistic update
    setCarrito((prev) =>
      normalizarCarrito([...prev, { ...producto, cantidad }])
    );

    setSyncingIds((prev) => [...prev, producto.id]);

    try {
      const res = await fetch(`${API}/carrito/add`, {
        method: "POST",
        headers: headersWithAuth(),
        body: JSON.stringify({ producto: { ...producto, cantidad } }),
      });

      if (!res.ok) throw new Error("Error agregando producto");

      const data = await res.json();
      setCarrito(normalizarCarrito(data?.productos || []));
    } catch (err) {
      console.error("❌ Error agregando al carrito:", err);
    } finally {
      setSyncingIds((prev) => prev.filter((id) => id !== producto.id));
    }
  };

  // 🔹 actualizar cantidad
  const actualizarCantidad = async (productoId, cantidad) => {
    if (!token) return;

    const cantidadNum = Number(cantidad);
    if (!Number.isInteger(cantidadNum) || cantidadNum < 1) return;

    setCarrito((prev) =>
      prev.map((p) =>
        p.id === productoId ? { ...p, cantidad: cantidadNum } : p
      )
    );

    setSyncingIds((prev) => [...prev, productoId]);

    try {
      const res = await fetch(`${API}/carrito/add`, {
        method: "POST",
        headers: headersWithAuth(),
        body: JSON.stringify({
          producto: { id: productoId, cantidad: cantidadNum },
        }),
      });

      if (!res.ok) throw new Error("Error actualizando cantidad");

      const data = await res.json();
      setCarrito(normalizarCarrito(data?.productos || []));
    } catch (err) {
      console.error("❌ Error actualizando cantidad:", err);
    } finally {
      setSyncingIds((prev) => prev.filter((id) => id !== productoId));
    }
  };

  // 🔹 eliminar producto
  const eliminarDelCarrito = async (productoId) => {
    if (!token) return;

    setCarrito((prev) => prev.filter((p) => p.id !== productoId));
    setSyncingIds((prev) => [...prev, productoId]);

    try {
      const res = await fetch(`${API}/carrito/remove`, {
        method: "PUT",
        headers: headersWithAuth(),
        body: JSON.stringify({ productoId }),
      });

      if (!res.ok) throw new Error("Error eliminando producto");

      const data = await res.json();
      setCarrito(normalizarCarrito(data?.productos || []));
    } catch (err) {
      console.error("❌ Error eliminando producto:", err);
    } finally {
      setSyncingIds((prev) => prev.filter((id) => id !== productoId));
    }
  };

  // 🔹 vaciar carrito
  const vaciarCarrito = async () => {
    if (!token) return;

    const allIds = carrito.map((p) => p.id);
    setSyncingIds(allIds);
    setCarrito([]);

    try {
      const res = await fetch(`${API}/carrito/clear`, {
        method: "PUT",
        headers: headersWithAuth(),
      });

      if (!res.ok) throw new Error("Error vaciando carrito");
    } catch (err) {
      console.error("❌ Error vaciando carrito:", err);
    } finally {
      setSyncingIds([]);
    }
  };

  const total = useMemo(
    () =>
      carrito.reduce(
        (acc, item) =>
          acc +
          Number(item?.precio || 0) * Number(item?.cantidad || 1),
        0
      ),
    [carrito]
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        loading,
        syncingIds,
        total,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};