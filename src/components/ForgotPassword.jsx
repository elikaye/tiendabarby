
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.info("Ingresá tu email");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/forgot-password`, // 👈 SIN /api/v1 acá
        { email }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEmail("");
      } else {
        toast.error("No se pudo procesar la solicitud");
      }
    } catch (err) {
      console.error("Error forgot password:", err);
      toast.error("No se pudo procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 px-4 pt-20 sm:pt-24 pb-12">
      <div className="mx-auto w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Recuperar contraseña
        </h2>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 active:bg-black transition-colors text-white font-body font-semibold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          ¿Ya recordaste tu contraseña?{" "}
          <Link
            to="/auth"
            className="text-pink-500 font-body font-semibold"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;