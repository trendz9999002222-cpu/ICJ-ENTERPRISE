/**
 * HelpdeskSupportService — ICJ Enterprise Platform
 * Provides Enterprise Customer Care, Support Ticket Tracking, and Resolution Management
 * for Litigants, Advocates, and Support Employees.
 */

const HELPDESK_TICKETS_KEY = "icj_helpdesk_tickets";

export const HelpdeskSupportService = {
  /**
   * Get all helpdesk tickets
   */
  getTickets() {
    try {
      const raw = localStorage.getItem(HELPDESK_TICKETS_KEY);
      return raw ? JSON.parse(raw) : [
        {
          id: "TICKET-101",
          ticketNo: "HD-2026-001",
          category: "LEGAL_COUNSEL_ASSIGNMENT",
          subject: "वकील आवंटन के संबंध में सहायता",
          description: "मेरे सिविल केस हेतु आवंटित वरिष्ठ वकील से संपर्क नहीं हो पा रहा है।",
          submittedBy: "Empaneled Litigant Member",
          contactPhone: "+91 9876543210",
          role: "member",
          status: "OPEN",
          priority: "HIGH",
          assignedDesk: "Customer Care Desk",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          resolutionNotes: "",
        },
        {
          id: "TICKET-102",
          ticketNo: "HD-2026-002",
          category: "BILLING",
          subject: "पेमेंट रसीद व जीएसटी बिल सहायता",
          description: "केस क्रेडिट रीचार्ज की जीएसटी रसीद प्राप्त नहीं हुई है।",
          submittedBy: "Empaneled Senior Counsel",
          contactPhone: "+91 9811223344",
          role: "advocate",
          status: "IN_PROGRESS",
          priority: "MEDIUM",
          assignedDesk: "Finance & Billing Desk",
          createdAt: new Date(Date.now() - 18000000).toISOString(),
          resolutionNotes: "फाइनेंस टीम द्वारा रसीद ईमेल पर भेज दी गई है।",
        },
      ];
    } catch {
      return [];
    }
  },

  /**
   * Submit a new 1-Click Helpdesk Support Ticket
   */
  createTicket({ category, subject, description, submittedBy, contactPhone, role }) {
    const tickets = this.getTickets();
    const newTicket = {
      id: `TICKET-${Date.now()}`,
      ticketNo: `HD-2026-${Math.floor(100 + Math.random() * 900)}`,
      category: category || "GENERAL_HELP",
      subject: subject || "सामान्य सहायता अर्जी",
      description: description || "",
      submittedBy: submittedBy || "Litigant",
      contactPhone: contactPhone || "N/A",
      role: role || "member",
      status: "OPEN",
      priority: category === "LEGAL_COUNSEL_ASSIGNMENT" ? "HIGH" : "MEDIUM",
      assignedDesk: category === "BILLING" ? "Finance & Billing Desk" : "Customer Care Desk",
      createdAt: new Date().toISOString(),
      resolutionNotes: "",
    };

    tickets.unshift(newTicket);
    localStorage.setItem(HELPDESK_TICKETS_KEY, JSON.stringify(tickets));
    return newTicket;
  },

  /**
   * Update Helpdesk Ticket Status & Resolution
   */
  updateTicketStatus(ticketId, status, resolutionNotes = "") {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index !== -1) {
      tickets[index].status = status;
      if (resolutionNotes) tickets[index].resolutionNotes = resolutionNotes;
      tickets[index].updatedAt = new Date().toISOString();
      localStorage.setItem(HELPDESK_TICKETS_KEY, JSON.stringify(tickets));
      return tickets[index];
    }
    return null;
  },
};

export default HelpdeskSupportService;
