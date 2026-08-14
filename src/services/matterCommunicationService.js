/**
 * ICJ Matter Communication Service — Secure, Matter-Scoped Two-Way Communication
 * Supports text and voice messages, transcription records, AI-suggested updates, and confirmation.
 */

import LegalMatterDataService from "./legalMatterDataService.js";
import ActivityService from "./activityService.js";

const COMMUNICATIONS_KEY = "icj_matter_communications_v1";

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
      console.error(`[MatterCommunicationService] Storage write failed: ${key}`, err);
    }
  },
};

export const MatterCommunicationService = {
  /**
   * Send a message linked to a specific matter/case
   */
  sendMessage(matterId, senderId, senderName, senderRole, { type, text, audioUrl, duration }) {
    if (!matterId) throw new Error("Matter ID is required to send messages.");

    const all = store.get(COMMUNICATIONS_KEY, {});
    if (!all[matterId]) {
      all[matterId] = [];
    }

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      matterId,
      senderId,
      senderName,
      senderRole,
      type: type || "TEXT", // "TEXT" | "VOICE"
      text: text || "",
      audioUrl: audioUrl || null, // Base64 audio representation or URL
      duration: duration || null,
      timestamp: new Date().toISOString(),
      analysisStatus: "PENDING",
      aiExtractions: [],
      confirmationStatus: "PENDING",
      auditTrail: [
        { action: "CREATED", by: senderName, timestamp: new Date().toISOString() }
      ]
    };

    all[matterId].push(newMessage);
    store.set(COMMUNICATIONS_KEY, all);

    // Create activity event
    ActivityService.create({
      title: `${senderRole === "client" ? "Client" : "Advocate"} sent ${type.toLowerCase()} message in Case ${matterId}`,
      type: "communication",
    });

    // Trigger extraction on text
    if (text) {
      this.analyzeForMatterUpdates(matterId, newMessage.id);
    }

    return newMessage;
  },

  /**
   * Retrieve messages for a specific matter
   */
  getMessages(matterId) {
    if (!matterId) return [];
    const all = store.get(COMMUNICATIONS_KEY, {});
    return all[matterId] || [];
  },

  /**
   * Run AI analysis on the transcript/text of a message to propose matter updates
   */
  analyzeForMatterUpdates(matterId, messageId) {
    const all = store.get(COMMUNICATIONS_KEY, {});
    const messages = all[matterId] || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) return;

    const message = messages[messageIndex];
    if (!message.text) return;

    // Run extraction logic
    const extraction = LegalMatterDataService.extractFromText(
      message.text,
      message.type === "VOICE" ? "VOICE_TRANSCRIBED" : "USER_INPUT",
      `Message: ${message.senderName}`
    );

    const proposals = [];

    // Map extracted facts to specific matter fields
    if (extraction.dates && extraction.dates.length > 0) {
      // Propose cause of action date or next hearing date based on text keywords
      const isHearing = /hearing|सुनवाई|तारीख|पेशी/i.test(message.text);
      proposals.push({
        key: isHearing ? "next_hearing_date" : "cause_of_action_date",
        label: isHearing ? "Next Hearing Date" : "Date of Cause of Action",
        value: extraction.dates[0],
        confidence: "MEDIUM",
        status: "PENDING_CONFIRMATION",
      });
    }

    if (extraction.caseNumbers && extraction.caseNumbers.length > 0) {
      proposals.push({
        key: "case_number",
        label: "Case Number",
        value: extraction.caseNumbers[0],
        confidence: "HIGH",
        status: "PENDING_CONFIRMATION",
      });
    }

    if (extraction.firNumbers && extraction.firNumbers.length > 0) {
      proposals.push({
        key: "fir_number",
        label: "FIR Number",
        value: extraction.firNumbers[0],
        confidence: "HIGH",
        status: "PENDING_CONFIRMATION",
      });
    }

    if (extraction.amounts && extraction.amounts.length > 0) {
      proposals.push({
        key: "sale_consideration",
        label: "Sale Consideration / Amount",
        value: extraction.amounts[0].replace(/[^\d\.]/g, ""),
        confidence: "MEDIUM",
        status: "PENDING_CONFIRMATION",
      });
    }

    message.aiExtractions = proposals;
    message.analysisStatus = "COMPLETED";
    message.confirmationStatus = proposals.length > 0 ? "PENDING" : "NOT_APPLICABLE";

    messages[messageIndex] = message;
    all[matterId] = messages;
    store.set(COMMUNICATIONS_KEY, all);
  },

  /**
   * Confirm an AI-proposed matter update
   */
  confirmMatterUpdate(matterId, messageId, fieldKey, value, memberId) {
    const all = store.get(COMMUNICATIONS_KEY, {});
    const messages = all[matterId] || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) return false;

    const message = messages[messageIndex];
    const extIndex = message.aiExtractions.findIndex(e => e.key === fieldKey);

    if (extIndex !== -1) {
      message.aiExtractions[extIndex].status = "CONFIRMED";
      message.aiExtractions[extIndex].value = value;
      message.confirmationStatus = "CONFIRMED";
      message.auditTrail.push({
        action: "CONFIRMED",
        by: `Advocate/Member`,
        field: fieldKey,
        value,
        timestamp: new Date().toISOString()
      });

      // Save verified value to Matter record via LegalMatterDataService
      LegalMatterDataService.confirmField(memberId, matterId, fieldKey, value);

      messages[messageIndex] = message;
      all[matterId] = messages;
      store.set(COMMUNICATIONS_KEY, all);

      ActivityService.create({
        title: `Confirmed field ${fieldKey} as "${value}" from communication`,
        type: "legal",
      });

      return true;
    }

    return false;
  },

  /**
   * Reject an AI-proposed matter update
   */
  rejectMatterUpdate(matterId, messageId, fieldKey) {
    const all = store.get(COMMUNICATIONS_KEY, {});
    const messages = all[matterId] || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) return false;

    const message = messages[messageIndex];
    const extIndex = message.aiExtractions.findIndex(e => e.key === fieldKey);

    if (extIndex !== -1) {
      message.aiExtractions[extIndex].status = "REJECTED";
      message.confirmationStatus = "REJECTED";
      message.auditTrail.push({
        action: "REJECTED",
        by: `Advocate/Member`,
        field: fieldKey,
        timestamp: new Date().toISOString()
      });

      messages[messageIndex] = message;
      all[matterId] = messages;
      store.set(COMMUNICATIONS_KEY, all);

      ActivityService.create({
        title: `Rejected field proposal ${fieldKey} from communication`,
        type: "legal",
      });

      return true;
    }

    return false;
  },

  /**
   * Search through message transcripts across cases
   */
  getTranscriptsBySearch(searchTerm) {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    const all = store.get(COMMUNICATIONS_KEY, {});

    const results = [];
    Object.keys(all).forEach(matterId => {
      const messages = all[matterId];
      messages.forEach(msg => {
        if (msg.text && msg.text.toLowerCase().includes(term)) {
          results.push({
            matterId,
            messageId: msg.id,
            senderName: msg.senderName,
            senderRole: msg.senderRole,
            type: msg.type,
            text: msg.text,
            timestamp: msg.timestamp,
          });
        }
      });
    });

    return results;
  }
};

export default MatterCommunicationService;
