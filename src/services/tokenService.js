import TokenLedgerService from "./tokenLedgerService";

/**
 * Consolidated TokenService
 * Forwarding to single source of truth: tokenLedgerService.js
 */
const TokenService = {
  async getAll() {
    return TokenLedgerService.getLedger();
  },

  async create(tokenData = {}) {
    return TokenLedgerService.recordTransaction(tokenData);
  },

  async update(id, values) {
    return TokenLedgerService.getLedger();
  },

  async remove(id) {
    return TokenLedgerService.getLedger();
  },
};

export default TokenService;
