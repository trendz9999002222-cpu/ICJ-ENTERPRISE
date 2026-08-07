import {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
} from "./database";
import { requirePositiveNumber } from "../utils/validation";

const DonationService = {
  async getAll() {
    return await getDonations();
  },

  async create(donationData = {}) {
    const amount = requirePositiveNumber(donationData.amount || 0, "Donation amount");
    const donation = {
      id: Date.now(),
      receiptNo: "DON-" + Date.now(),
      amount,
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