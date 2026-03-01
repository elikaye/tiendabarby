
// models/FrontendSettings.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const FrontendSettings = sequelize.define(
  "FrontendSettings",
  {
    bannerUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bannerBlur: {
      type: DataTypes.BOOLEAN, // ✅ CORREGIDO
      allowNull: false,
      defaultValue: false,
    },
    cintaTexto: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    cintaVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "frontend_settings",
    timestamps: true,
    paranoid: false,
  }
);

export default FrontendSettings;