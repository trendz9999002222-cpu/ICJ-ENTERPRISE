/**
 * ICJ ENTERPRISE PLATFORM
 * Base Provider Interface for OTP delivery adapters
 */
export class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Send the OTP/Message payload
   * @param {string} to - Destination identifier (phone or email)
   * @param {string} otp - Plaintext OTP code
   * @param {object} config - Configurations / API Keys
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async send(to, otp, config = {}) {
    throw new Error("Method 'send' must be implemented.");
  }
}

export default BaseProvider;
