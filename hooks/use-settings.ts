"use client";

import { useEffect, useState } from "react";

interface UserSettings {
  hardwareAcceleration: boolean;
  animationsEnabled: boolean;
  emailNotifications: boolean;
  inventoryUpdates: boolean;
  commissionUpdates: boolean;
  systemUpdates: boolean;
  theme: "light" | "dark" | "system";
}

const defaultSettings: UserSettings = {
  hardwareAcceleration: true,
  animationsEnabled: true,
  emailNotifications: true,
  inventoryUpdates: true,
  commissionUpdates: true,
  systemUpdates: false,
  theme: "system",
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar configurações do localStorage
    const loadSettings = () => {
      try {
        const savedSettings: Partial<UserSettings> = {
          hardwareAcceleration:
            localStorage.getItem("hardwareAcceleration") === "true",
          animationsEnabled:
            localStorage.getItem("animations-enabled") !== "false",
          emailNotifications:
            localStorage.getItem("email-notifications") !== "false",
          inventoryUpdates:
            localStorage.getItem("inventory-updates") !== "false",
          commissionUpdates:
            localStorage.getItem("commission-updates") !== "false",
          systemUpdates: localStorage.getItem("system-updates") === "true",
          theme:
            (localStorage.getItem("theme") as "light" | "dark" | "system") ||
            "system",
        };

        setSettings((prev) => ({ ...prev, ...savedSettings }));
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Salvar no localStorage
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Erro ao salvar configuração ${key}:`, error);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);

    // Limpar localStorage
    Object.keys(defaultSettings).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Erro ao limpar configuração ${key}:`, error);
      }
    });
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      const validatedSettings = { ...defaultSettings, ...importedSettings };

      setSettings(validatedSettings);

      // Salvar no localStorage
      Object.entries(validatedSettings).forEach(([key, value]) => {
        localStorage.setItem(key, String(value));
      });

      return true;
    } catch (error) {
      console.error("Erro ao importar configurações:", error);
      return false;
    }
  };

  return {
    ...settings,
    isLoading,
    updateSetting,
    resetToDefaults,
    exportSettings,
    importSettings,
    // Manter compatibilidade com versão anterior
    setHardwareAcceleration: (value: boolean) =>
      updateSetting("hardwareAcceleration", value),
  };
}
