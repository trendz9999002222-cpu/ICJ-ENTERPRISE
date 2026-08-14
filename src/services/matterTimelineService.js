/**
 * ICJ Matter Timeline & Action Service
 * Manages timeline logs, court hearing events, instructions, and tasks.
 */

import ActivityService from "./activityService.js";

const TIMELINE_KEY = "icj_matter_timeline_v1";
const ACTIONS_KEY = "icj_matter_actions_v1";

const store = {
  get(key, defaultVal = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (err) {
      console.error(`[MatterTimelineService] Storage write failed: ${key}`, err);
    }
  },
};

export const MatterTimelineService = {
  /**
   * Add a timeline event to a matter
   */
  addEvent(matterId, { eventType, title, description, sourceType, sourceId, speaker }) {
    if (!matterId) return null;

    const all = store.get(TIMELINE_KEY, {});
    if (!all[matterId]) {
      all[matterId] = [];
    }

    const newEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      matterId,
      date: new Date().toISOString(),
      eventType: eventType || "SYSTEM", // "HEARING" | "VOICE_UPDATE" | "DOCUMENT" | "ADVOCATE_INSTRUCTION" | "CLIENT_RESPONSE" | "TASK" | "SYSTEM"
      title,
      description,
      sourceType: sourceType || "USER_ENTRY", // "VOICE_RECORDING" | "TEXT" | "DOCUMENT" | "USER_ENTRY" | "COURT_ORDER"
      sourceId: sourceId || null,
      speaker: speaker || null,
      timestamp: new Date().toISOString()
    };

    all[matterId].unshift(newEvent);
    store.set(TIMELINE_KEY, all);

    ActivityService.create({
      title: `New event added to Case ${matterId} timeline: ${title}`,
      type: "timeline",
    });

    return newEvent;
  },

  /**
   * Get all timeline events for a matter
   */
  getEvents(matterId) {
    if (!matterId) return [];
    const all = store.get(TIMELINE_KEY, {});
    return all[matterId] || [];
  },

  /**
   * Add a task / action item to a case/matter
   */
  addAction(matterId, { title, responsible, dueDate, sourceRecordingId }) {
    if (!matterId) return null;

    const all = store.get(ACTIONS_KEY, {});
    if (!all[matterId]) {
      all[matterId] = [];
    }

    const newAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      matterId,
      title,
      responsible: responsible || "client", // "client" | "advocate" | "system"
      dueDate: dueDate || "Not specified",
      sourceRecordingId: sourceRecordingId || null,
      status: "PENDING", // "PENDING" | "ASSIGNED" | "COMPLETED" | "REJECTED"
      createdDate: new Date().toISOString(),
    };

    all[matterId].unshift(newAction);
    store.set(ACTIONS_KEY, all);

    ActivityService.create({
      title: `New Action Item created for Case ${matterId}: "${title}"`,
      type: "action",
    });

    return newAction;
  },

  /**
   * Get all action items for a case/matter
   */
  getActions(matterId) {
    if (!matterId) return [];
    const all = store.get(ACTIONS_KEY, {});
    return all[matterId] || [];
  },

  /**
   * Update the status of a task/action item
   */
  updateActionStatus(matterId, actionId, status) {
    const all = store.get(ACTIONS_KEY, {});
    const actions = all[matterId] || [];
    const actionIndex = actions.findIndex(a => a.id === actionId);

    if (actionIndex !== -1) {
      actions[actionIndex].status = status; // "PENDING" | "ASSIGNED" | "COMPLETED" | "REJECTED"
      actions[actionIndex].updatedDate = new Date().toISOString();
      all[matterId] = actions;
      store.set(ACTIONS_KEY, all);

      ActivityService.create({
        title: `Task status updated to ${status} for ID ${actionId}`,
        type: "action",
      });

      // Add to timeline
      this.addEvent(matterId, {
        eventType: "TASK",
        title: `Task status updated: ${actions[actionIndex].title}`,
        description: `Status changed to ${status}`,
        sourceType: "USER_ENTRY",
      });

      return true;
    }
    return false;
  }
};

export default MatterTimelineService;
