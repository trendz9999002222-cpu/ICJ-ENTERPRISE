import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
} from "./database";

export const WalletService = {

  async getAll() {
    return await getWallets();
  },

  async create(memberId) {

    const wallet = {

      id: Date.now(),

      memberId,

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