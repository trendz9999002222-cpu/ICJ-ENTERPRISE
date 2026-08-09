import { getSystemSettings, saveSystemSettings } from "./database";

const defaultSettings = {
  id: 1,
  enableNotifications: true,
  enableAuditLog: true,
  compactView: false,
};

const SettingsService = {
  async get() {
    const data = await getSystemSettings();
    return { ...defaultSettings, ...(data || {}) };
  },

  async save(settings) {
    return await saveSystemSettings({ ...defaultSettings, ...settings });
  },
};

export default SettingsService;
