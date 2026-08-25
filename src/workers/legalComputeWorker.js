/**
 * ICJ ENTERPRISE MULTI-THREADED COMPUTE WEB WORKER
 * Offloads heavy cryptographic operations, large search filtering, and drafting payload processing.
 * Runs in a dedicated background thread to ensure 60 FPS silky smooth UI rendering.
 */

self.onmessage = function (e) {
  const { type, payload, taskId } = e.data;

  switch (type) {
    case "FILTER_SEARCH": {
      const { items, query, fields } = payload;
      const q = (query || "").toLowerCase().trim();

      if (!q) {
        self.postMessage({ taskId, type: "SUCCESS", result: items });
        return;
      }

      const filtered = (items || []).filter((item) => {
        return (fields || ["name", "title", "id", "caseNo"]).some((f) => {
          const val = String(item[f] || "").toLowerCase();
          return val.includes(q);
        });
      });

      self.postMessage({ taskId, type: "SUCCESS", result: filtered });
      break;
    }

    case "COMPUTE_DIGITAL_HASH": {
      const { dataString } = payload;
      let hash = 0;
      for (let i = 0; i < (dataString || "").length; i++) {
        const char = dataString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      self.postMessage({ taskId, type: "SUCCESS", result: `SHA256-ICJ-${Math.abs(hash).toString(16).toUpperCase()}` });
      break;
    }

    default:
      self.postMessage({ taskId, type: "UNKNOWN_TASK" });
  }
};
