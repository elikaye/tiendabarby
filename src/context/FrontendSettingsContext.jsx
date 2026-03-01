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

  const API =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/frontend-settings`);

        if (res.data) {
          const sanitized = {
            bannerUrl: res.data.bannerUrl || null,
            bannerBlur: Number(res.data.bannerBlur) === 1,
            cintaTexto: res.data.cintaTexto || "",
            cintaVisible: Number(res.data.cintaVisible) === 1,
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
  }, [API]);

  const updateSettings = async (newSettings) => {
    try {
      const res = await axios.put(`${API}/frontend-settings`, {
        ...settings,
        ...newSettings,
      });

      const sanitized = {
        bannerUrl: res.data.bannerUrl || null,
        bannerBlur: Number(res.data.bannerBlur) === 1,
        cintaTexto: res.data.cintaTexto || "",
        cintaVisible: Number(res.data.cintaVisible) === 1,
      };

      setSettings(sanitized);
    } catch (error) {
      console.error("Error guardando settings:", error);
    }
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