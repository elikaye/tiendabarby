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

const API =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// 🔥 genera clave única por variante
const generarKey = (p) =>
  `${p.id}-${p.color || "sincolor"}-${p.talle || "sintalle"}`;

// 🔥 normaliza por variante
const normalizarCarrito = (productos = []) => {
  const map = new Map();

  productos.forEach((p) => {
    if (!p || !p.id) return;

    const key = generarKey(p);
    const cantidad = Number(p.cantidad || 1);

    if (map.has(key)) {
      map.get(key).cantidad += cantidad;
    } else {
      map.set(key, { ...p, cantidad, uniqueKey: key });
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

        const data = await res.json();
        setCarrito(normalizarCarrito(data?.productos || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCarrito();
  }, [user, token]);

  // 🔥 AGREGAR
  const agregarAlCarrito = async (producto, cantidad = 1) => {
    if (!token || !producto?.id) return;

    const key = generarKey(producto);

    setCarrito((prev) =>
      normalizarCarrito([...prev, { ...producto, cantidad }])
    );

    setSyncingIds((prev) => [...prev, key]);

    try {
      await fetch(`${API}/carrito/add`, {
        method: "POST",
        headers: headersWithAuth(),
        body: JSON.stringify({ producto: { ...producto, cantidad } }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingIds((prev) => prev.filter((id) => id !== key));
    }
  };

  // 🔥 ELIMINAR POR VARIANTE
  const eliminarDelCarrito = async (uniqueKey) => {
    if (!token) return;

    setCarrito((prev) =>
      prev.filter((p) => p.uniqueKey !== uniqueKey)
    );

    setSyncingIds((prev) => [...prev, uniqueKey]);

    try {
      await fetch(`${API}/carrito/remove`, {
        method: "PUT",
        headers: headersWithAuth(),
        body: JSON.stringify({ uniqueKey }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingIds((prev) =>
        prev.filter((id) => id !== uniqueKey)
      );
    }
  };

  const vaciarCarrito = async () => {
    if (!token) return;

    setCarrito([]);
    try {
      await fetch(`${API}/carrito/clear`, {
        method: "PUT",
        headers: headersWithAuth(),
      });
    } catch (err) {
      console.error(err);
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
        eliminarDelCarrito,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};