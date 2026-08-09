import AppConfig from "../config/app.config";

const System = {
  getAppName() {
    return AppConfig.app.name;
  },

  getPlatformName() {
    return AppConfig.app.platform;
  },

  getVersion() {
    return AppConfig.app.version;
  },

  getEnvironment() {
    return AppConfig.app.environment;
  },
};

export default System;