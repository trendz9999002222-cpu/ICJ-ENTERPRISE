import {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
} from "./database.js";

const DonationService = {
  async getAll() {
    return await getDonations();
  },

  async create(donationData = {}) {
    const donation = {
      id: Date.now(),
      receiptNo: "DON-" + Date.now(),
      amount: donationData.amount || 0,
      donorName: donationData.donorName || "",
      memberId: donationData.memberId || null,
      paymentMode: donationData.paymentMode || "Cash",
      status: "Received",
      createdAt: new Date().toISOString(),
      ...donationData,
    };

    return await addDonation(donation);
  },

  async update(id, values) {
    await updateDonation(id, values);
  },

  async remove(id) {
    await deleteDonation(id);
  },
};

export default DonationService;