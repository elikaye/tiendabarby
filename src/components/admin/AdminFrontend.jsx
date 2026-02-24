import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFrontendSettings } from "../../context/FrontendSettingsContext";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  API_BASE_URL,
} from "../../config";

const AdminFrontend = () => {
  const { settings, updateSettings } = useFrontendSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) handleChange("bannerUrl", data.secure_url);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error subiendo la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyChanges = async () => {
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        bannerUrl: localSettings.bannerUrl || null,
        bannerBlur: Boolean(localSettings.bannerBlur),
        cintaTexto: localSettings.cintaTexto || "",
        cintaVisible: localSettings.cintaVisible ?? true,
      };

      const res = await axios.put(
        `${API_BASE_URL}/frontend-settings`,
        payload
      );

      const updated = {
        bannerUrl: res.data.bannerUrl,
        bannerBlur: Boolean(res.data.bannerBlur),
        cintaTexto: res.data.cintaTexto || "",
        cintaVisible: res.data.cintaVisible ?? true,
      };

      updateSettings(updated);
      setLocalSettings(updated);

      setSuccessMessage("Cambios aplicados correctamente");

      // Se limpia solo (mejor UX para demo)
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">
        Configuración del Frontend
      </h2>

      {/* Banner */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Subir banner
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="w-full border rounded p-2"
        />

        {uploading && (
          <p className="text-sm text-gray-500 mt-1">Subiendo…</p>
        )}

        {/* Preview banner con blur SOLO de relleno */}
        {localSettings.bannerUrl && (
          <div className="relative mt-4 h-48 w-full overflow-hidden rounded bg-black">
            {localSettings.bannerBlur && (
              <div
                className="absolute inset-0 bg-center bg-cover blur-2xl scale-110"
                style={{
                  backgroundImage: `url(${localSettings.bannerUrl})`,
                }}
              />
            )}

            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img
                src={localSettings.bannerUrl}
                alt="Preview banner"
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Blur */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(localSettings.bannerBlur)}
          onChange={(e) =>
            handleChange("bannerBlur", e.target.checked)
          }
        />
        <span>Blur en los costados del banner</span>
      </div>

      {/* Texto cinta */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Texto de la cinta informativa
        </label>
        <input
          type="text"
          value={localSettings.cintaTexto || ""}
          onChange={(e) =>
            handleChange("cintaTexto", e.target.value)
          }
          className="w-full border rounded p-2"
          placeholder="Ej: 30% OFF en toda la tienda"
        />
      </div>

      {/* Toggle cinta */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="checkbox"
          checked={localSettings.cintaVisible}
          onChange={(e) =>
            handleChange("cintaVisible", e.target.checked)
          }
        />
        <span>Mostrar cinta informativa</span>
      </div>

      {/* Preview cinta */}
      {localSettings.cintaVisible && localSettings.cintaTexto && (
        <div className="mb-6 overflow-hidden bg-pink-500/70 text-black py-2 px-4 font-medium whitespace-nowrap backdrop-blur-sm">
          <div className="inline-block animate-marquee">
            {`${localSettings.cintaTexto} • `.repeat(8)}
          </div>
        </div>
      )}

      {/* Feedback visual */}
      {successMessage && (
        <p className="mb-4 text-pink-500 font-medium">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mb-4 text-red-600 font-medium">
          {errorMessage}
        </p>
      )}

      <button
        onClick={handleApplyChanges}
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Guardando…" : "Aplicar cambios"}
      </button>
    </div>
  );
};

export default AdminFrontend;
