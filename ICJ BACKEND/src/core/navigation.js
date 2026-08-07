import Modules from "./modules";

/**
 * Enterprise Navigation Engine
 * ------------------------------------
 * सभी Sidebar Navigation इसी फ़ाइल से नियंत्रित होंगे।
 * भविष्य में Role, Permission, White Label,
 * Multi-Tenant और Plugin System यहीं से जुड़ेगा।
 */

const Navigation = Modules
  .filter((module) => module.enabled && module.sidebar)
  .sort((a, b) => (a.order || 999) - (b.order || 999))
  .map((module) => ({
    id: module.id,
    title: module.name,
    path: module.route,
    icon: module.icon,
    category: module.category,
    permissions: module.permissions || [],
    version: module.version || "1.0.0",
  }));

/* ---------- Helper Functions ---------- */

export const getNavigation = () => Navigation;

export const getNavigationByCategory = (category) =>
  Navigation.filter((item) => item.category === category);

export const getNavigationItem = (id) =>
  Navigation.find((item) => item.id === id);

export default Navigation;