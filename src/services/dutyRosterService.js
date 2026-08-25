/**
 * DutyRosterService — ICJ Enterprise Platform
 * Unified Governance Engine for:
 * 1. Duty Advocates, Duty Notaries & Duty Oath Commissioners
 * 2. Dynamic Configurable SLA Countdown Timers (5m, 15m, 30m, 1h, 2h)
 * 3. Advocate Self-Service Territory Opt-in Requests (South Goa, Western Rajasthan, Delhi, Mumbai, etc.)
 * 4. Dual Fulfillment Modes (Court Premises vs. Doorstep Home Visit Execution)
 * 5. Automatic Round-Robin SLA Auto-Transfer & 3-Way Alerting
 */

const SLA_TIMER_CONFIG_KEY = "icj_sla_timer_config";
const DUTY_ROSTER_KEY = "icj_duty_roster_data";
const TERRITORY_REQUESTS_KEY = "icj_duty_territory_requests";
const DUTY_TOGGLE_PREFIX = "icj_duty_availability_";

export const DutyRosterService = {
  /**
   * SLA TIMER CONFIGURATION (5m, 15m, 30m, 1h, 2h)
   */
  getSLATimerMinutes() {
    try {
      const val = localStorage.getItem(SLA_TIMER_CONFIG_KEY);
      return val ? parseInt(val, 10) : 15; // Default 15 minutes
    } catch {
      return 15;
    }
  },

  setSLATimerMinutes(mins) {
    try {
      localStorage.setItem(SLA_TIMER_CONFIG_KEY, String(mins));
      return mins;
    } catch {
      return 15;
    }
  },

  /**
   * ADVOCATE SELF-SERVICE: TOGGLE ON/OFF DUTY AVAILABILITY
   */
  setAdvocateDutyToggle(userId, isAvailable) {
    try {
      localStorage.setItem(`${DUTY_TOGGLE_PREFIX}${userId}`, isAvailable ? "ON" : "OFF");
      return isAvailable;
    } catch {
      return false;
    }
  },

  getAdvocateDutyToggle(userId) {
    try {
      const val = localStorage.getItem(`${DUTY_TOGGLE_PREFIX}${userId}`);
      return val === "ON";
    } catch {
      return false;
    }
  },

  /**
   * ADVOCATE SELF-SERVICE: SUBMIT TERRITORY OPT-IN REQUEST
   */
  submitTerritoryOptIn({ userId, userName, userPhone, role, territoryRegion, territoryState, territoryDistrict, notes = "" }) {
    try {
      const requests = this.getTerritoryRequests();
      const newReq = {
        id: `DUTY-REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        userPhone: userPhone || "+91 9876543210",
        role: role || "advocate",
        territoryRegion: territoryRegion || "Delhi & NCR",
        territoryState: territoryState || "Delhi",
        territoryDistrict: territoryDistrict || "New Delhi",
        notes,
        status: "PENDING", // PENDING, APPROVED, REJECTED
      };
      requests.unshift(newReq);
      localStorage.setItem(TERRITORY_REQUESTS_KEY, JSON.stringify(requests.slice(0, 100)));
      return newReq;
    } catch (e) {
      console.error("Territory opt-in failed", e);
      return null;
    }
  },

  getTerritoryRequests() {
    try {
      const raw = localStorage.getItem(TERRITORY_REQUESTS_KEY);
      return raw ? JSON.parse(raw) : [
        {
          id: "DUTY-REQ-001",
          timestamp: new Date().toISOString(),
          userId: "26ICJ08AA0106",
          userName: "Adv. Meenakshi Sundaram",
          userPhone: "+91 9820987654",
          role: "advocate",
          territoryRegion: "South Goa & Western Coast",
          territoryState: "Goa",
          territoryDistrict: "South Goa",
          notes: "Available for High Court & District Duty Roster Shift",
          status: "APPROVED",
        },
        {
          id: "DUTY-REQ-002",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userId: "26ICJ08AA0109",
          userName: "Adv. Gurpreet Singh Dhillon",
          userPhone: "+91 9872334455",
          role: "advocate",
          territoryRegion: "Western Rajasthan & Revenue Desk",
          territoryState: "Rajasthan",
          territoryDistrict: "Jodhpur / Bikaner",
          notes: "Available for Revenue & Land Title Duty Roster",
          status: "PENDING",
        },
      ];
    } catch {
      return [];
    }
  },

  approveTerritoryRequest(reqId) {
    try {
      const requests = this.getTerritoryRequests();
      const index = requests.findIndex((r) => r.id === reqId);
      if (index !== -1) {
        requests[index].status = "APPROVED";
        requests[index].approvedAt = new Date().toISOString();
        localStorage.setItem(TERRITORY_REQUESTS_KEY, JSON.stringify(requests));
        this.setAdvocateDutyToggle(requests[index].userId, true);
        return requests[index];
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * ACTIVE DUTY ROSTER LIST (ADVOCATES, NOTARIES, OATH COMMISSIONERS)
   */
  getActiveDutyRoster() {
    return [
      {
        id: "ICJ-2026-DUTY-ADV-01",
        userId: "ICJ-2026-MEM-0105",
        name: "Empaneled Duty Advocate",
        role: "Duty Advocate",
        region: "Delhi & NCR",
        phone: "+91 9810123456",
        fulfillmentMode: "COURT_PREMISES", // COURT_PREMISES | DOORSTEP_EXECUTIVE
        shift: "09:00 AM - 09:00 PM",
        activeAssignedCases: 1,
        maxCapacity: 5,
        dutyStatus: "ON_DUTY",
      },
      {
        id: "ICJ-2026-DUTY-NOTARY-01",
        userId: "ICJ-2026-MEM-0107",
        name: "Empaneled Notary Officer",
        role: "Duty Notary",
        region: "Uttar Pradesh & Noida",
        phone: "+91 9818765432",
        fulfillmentMode: "DOORSTEP_EXECUTIVE",
        shift: "24/7 Emergency",
        activeAssignedCases: 0,
        maxCapacity: 5,
        dutyStatus: "ON_DUTY",
      },
      {
        id: "DUTY-OATH-01",
        userId: "26ICJ08AA0108",
        name: "Adv. Ananya Roy (Oath Commissioner)",
        role: "Duty Oath Commissioner",
        region: "West Bengal & Eastern Desk",
        phone: "+91 9830112233",
        fulfillmentMode: "DOORSTEP_EXECUTIVE",
        shift: "08:00 AM - 08:00 PM",
        activeAssignedCases: 0,
        maxCapacity: 5,
        dutyStatus: "ON_DUTY",
      },
    ];
  },

  /**
   * ROUND-ROBIN SLA AUTO-TRANSFER ENGINE
   * Invoked when SLA Timer (e.g. 15 mins) expires for an unassigned litigant matter.
   */
  executeSLAAutoTransfer(matterId, litigantName, territory = "Delhi & NCR") {
    const dutyRoster = this.getActiveDutyRoster();
    const availableDutyOfficial = dutyRoster.find((d) => d.dutyStatus === "ON_DUTY") || dutyRoster[0];

    const slaMins = this.getSLATimerMinutes();
    const alertMessage = `⏱️ ${slaMins}-Min SLA Expired: Matter ${matterId} (${litigantName}) auto-transferred to Duty Official ${availableDutyOfficial.name} (${availableDutyOfficial.role}).`;

    return {
      success: true,
      matterId,
      assignedDutyOfficial: availableDutyOfficial,
      alertMessage,
      transferredAt: new Date().toISOString(),
    };
  },
};

export default DutyRosterService;
