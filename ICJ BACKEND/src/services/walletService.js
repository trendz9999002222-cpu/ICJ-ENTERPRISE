import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "./database";
import { requireString } from "../utils/validation";

export const WalletService = {

  async getAll() {
    return await getWallets();
  },

  async create(memberId) {
    const safeMemberId = requireString(memberId, "Member ID");

    const wallet = {

      id: Date.now(),

      memberId: safeMemberId,

      balance: 0,

      currency: "INR",

      status: "Active",

      createdAt: new Date().toISOString(),

    };

    return await addWallet(wallet);

  },

  async update(id, values) {
    await updateWallet(id, values);
  },

  async remove(id) {
    await deleteWallet(id);

  },

};

export default WalletService;