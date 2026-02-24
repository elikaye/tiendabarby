import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const FrontendSettingsContext = createContext();

export const FrontendSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    bannerUrl: null,
    bannerBlur: false,
    cintaTexto: "",
    cintaVisible: true,
  });

  const [loading, setLoading] = useState(true);

  // ✅ CORRECCIÓN: usar import.meta.env para URL de producción o fallback local
  const API =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/frontend-settings`);
        if (res.data) {
          const sanitized = {
            bannerUrl: res.data.bannerUrl || null,
            bannerBlur: Boolean(res.data.bannerBlur),
            cintaTexto: res.data.cintaTexto || "",
            cintaVisible: res.data.cintaVisible ?? true,
          };
          setSettings(sanitized);
        }
      } catch (error) {
        console.error("Error cargando settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API]); // ✅ agregar API a dependencias para evitar warning

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <FrontendSettingsContext.Provider
      value={{ settings, updateSettings, loading }}
    >
      {children}
    </FrontendSettingsContext.Provider>
  );
};

export const useFrontendSettings = () => useContext(FrontendSettingsContext);