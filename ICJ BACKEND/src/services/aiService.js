import AIConfiguration from "./ai/aiConfiguration";
import AIFeatureFlags from "./ai/aiFeatureFlags";
import AIPermissionService from "./ai/aiPermissionService";
import AIModuleRegistry from "./ai/aiModuleRegistry";
import AIPromptManager from "./ai/aiPromptManager";
import AILogger from "./ai/aiLogger";
import AIRequestHistory from "./ai/aiRequestHistory";
import AIAPIAdapter from "./ai/aiApiAdapter";
import AIErrorHandler from "./ai/aiErrorHandler";

const normalizeRole = (role) => String(role || "member").toLowerCase();

const AIService = {
  getConfiguration() {
    return AIConfiguration.get();
  },

  saveConfiguration(values = {}, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canManageSettings) {
        throw new Error("You do not have permission to manage AI settings.");
      }
      const next = AIConfiguration.save(values);
      AILogger.add({
        action: "config.update",
        message: "AI configuration updated.",
        actorRole: normalizeRole(role),
        metadata: values,
      });
      return next;
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "Unable to save AI settings.");
    }
  },

  getFeatureFlags() {
    return AIFeatureFlags.getAll();
  },

  setFeatureFlag(key, value, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canManageSettings) {
        throw new Error("You do not have permission to manage AI feature flags.");
      }
      const next = AIFeatureFlags.setFlag(key, value);
      AILogger.add({
        action: "feature-flag.update",
        message: `Feature flag ${key} set to ${Boolean(value)}.`,
        actorRole: normalizeRole(role),
        metadata: { key, value: Boolean(value) },
      });
      return next;
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "Unable to update AI feature flags.");
    }
  },

  getPermissions(role = "member") {
    return AIPermissionService.get(role);
  },

  getModules() {
    return AIModuleRegistry.getAll();
  },

  updateModule(moduleId, values = {}, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canManageSettings) {
        throw new Error("You do not have permission to manage AI modules.");
      }
      const next = AIModuleRegistry.update(moduleId, values);
      AILogger.add({
        action: "module.update",
        moduleId,
        message: `AI module ${moduleId} updated.`,
        actorRole: normalizeRole(role),
        metadata: values,
      });
      return next;
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "Unable to update AI module registration.");
    }
  },

  getPrompts(moduleId = null) {
    if (!moduleId) return AIPromptManager.getAll();
    return AIPromptManager.getByModule(moduleId);
  },

  createPrompt(payload = {}, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canManagePrompts) {
        throw new Error("You do not have permission to manage prompts.");
      }

      const prompt = AIPromptManager.create(payload);
      AILogger.add({
        action: "prompt.create",
        moduleId: prompt.moduleId,
        message: `Prompt ${prompt.name} created.`,
        actorRole: normalizeRole(role),
      });
      return prompt;
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "Unable to create prompt template.");
    }
  },

  updatePrompt(id, values = {}, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canManagePrompts) {
        throw new Error("You do not have permission to manage prompts.");
      }

      const prompt = AIPromptManager.update(id, values);
      AILogger.add({
        action: "prompt.update",
        moduleId: prompt?.moduleId || "global",
        message: `Prompt ${id} updated.`,
        actorRole: normalizeRole(role),
      });
      return prompt;
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "Unable to update prompt template.");
    }
  },

  removePrompt(id, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canManagePrompts) {
        throw new Error("You do not have permission to manage prompts.");
      }

      AIPromptManager.remove(id);
      AILogger.add({
        action: "prompt.remove",
        message: `Prompt ${id} removed.`,
        actorRole: normalizeRole(role),
      });
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "Unable to remove prompt template.");
    }
  },

  getLogs(role = "member") {
    const permissions = AIPermissionService.get(role);
    if (!permissions.canViewLogs) {
      return [];
    }
    return AILogger.getAll();
  },

  getRequestHistory(role = "member") {
    const permissions = AIPermissionService.get(role);
    if (!permissions.canViewHistory) {
      return [];
    }
    return AIRequestHistory.getAll();
  },

  getFoundationStatus(role = "member") {
    const config = AIConfiguration.get();
    const flags = AIFeatureFlags.getAll();
    const modules = AIModuleRegistry.getAll();
    const permissions = AIPermissionService.get(role);

    return {
      enabled: Boolean(config.enabled && flags.aiFoundationEnabled),
      provider: config.defaultProvider,
      modulesRegistered: modules.length,
      modulesEnabled: modules.filter((item) => item.enabled).length,
      flagsEnabled: Object.values(flags).filter((value) => typeof value === "boolean" && value).length,
      canUseAI: Boolean(permissions.canUseAI),
      canManageSettings: Boolean(permissions.canManageSettings),
    };
  },

  async request({ moduleId, promptText, promptId = "", context = {} } = {}, role = "member") {
    try {
      const permissions = AIPermissionService.get(role);
      if (!permissions.canUseAI) {
        throw new Error("You do not have permission to use AI foundation requests.");
      }

      if (!AIPermissionService.canAccessModule(role, moduleId)) {
        throw new Error("You do not have access to this AI module.");
      }

      const config = AIConfiguration.get();
      const flags = AIFeatureFlags.getAll();
      const moduleRegistration = AIModuleRegistry.getById(moduleId);

      if (!config.enabled || !flags.aiFoundationEnabled) {
        throw new Error("AI foundation is disabled in settings.");
      }

      if (!moduleRegistration?.enabled) {
        throw new Error("Selected module is disabled for AI foundation.");
      }

      if (moduleRegistration.bridgeKey && !flags[moduleRegistration.bridgeKey]) {
        throw new Error(`Feature flag ${moduleRegistration.bridgeKey} is disabled.`);
      }

      const normalizedPrompt = String(promptText || "").trim();
      if (!normalizedPrompt) {
        throw new Error("Prompt is required.");
      }

      if (normalizedPrompt.length > Number(config.maxPromptLength || 4000)) {
        throw new Error("Prompt exceeds configured maximum length.");
      }

      const historyEntry = AIRequestHistory.create({
        moduleId,
        provider: config.defaultProvider,
        promptId,
        promptText: flags.requestHistoryEnabled ? normalizedPrompt : "[history disabled]",
        status: "PENDING",
        actorRole: normalizeRole(role),
      });

      try {
        const result = await AIAPIAdapter.execute(config.defaultProvider, {
          moduleId,
          promptId,
          promptText: normalizedPrompt,
          context,
        });

        AIRequestHistory.update(historyEntry.id, {
          status: "SUCCESS",
          response: String(result.output || ""),
          durationMs: Number(result.durationMs || 0),
        });

        AILogger.add({
          level: "info",
          action: "request.success",
          moduleId,
          message: `AI foundation request completed for ${moduleId}.`,
          actorRole: normalizeRole(role),
          metadata: {
            provider: result.provider,
            status: result.status,
            durationMs: result.durationMs,
          },
        });

        return {
          requestId: historyEntry.id,
          moduleId,
          provider: result.provider,
          status: result.status,
          output: result.output,
          durationMs: result.durationMs,
        };
      } catch (error) {
        AIRequestHistory.update(historyEntry.id, {
          status: "FAILED",
          error: error?.message || "Request failed.",
        });

        AILogger.add({
          level: "error",
          action: "request.failed",
          moduleId,
          message: error?.message || "Request failed.",
          actorRole: normalizeRole(role),
        });
        throw error;
      }
    } catch (error) {
      throw AIErrorHandler.toUserError(error, "AI foundation request failed.");
    }
  },

  async ask(prompt, context = [], role = "member") {
    const result = await this.request(
      {
        moduleId: "dashboard",
        promptText: String(prompt || ""),
        promptId: "",
        context: { items: context },
      },
      role
    );
    return result.output;
  },
};

export default AIService;
