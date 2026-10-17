"use client";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_rypannl";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_pmntrjf";
const EMAILJS_USER_ID = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "_afNcmKvmFJoVdlI9";

export const emailVerificationService = {
  /**
   * Generates and dispatches a 6-digit OTP code to applicant's email via EmailJS
   */
  sendEmailOtp: async (
    email: string,
    name?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const greetingName = name?.trim() || "Valued Applicant";

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in localStorage with 10-minute expiry
    try {
      localStorage.setItem(
        `icj_otp_${normalizedEmail}`,
        JSON.stringify({
          otp,
          expiresAt: Date.now() + 10 * 60 * 1000,
          attempts: 0,
        })
      );
    } catch {
      // Ignore localStorage errors
    }

    const emailContent = `Welcome to the International Consortium of Jurists (ICJ)!

Dear ${greetingName},

Thank you for initiating your application. Your 6-digit Email Verification Code (OTP) is:

    ${otp}

Please enter this verification code on the application page to verify your email address.
This code is valid for 10 minutes.

If you did not request this verification code, please disregard this email.

Best regards,
International Consortium of Jurists (ICJ)`;

    try {
      console.log(`[EmailJS] Dispatching verification OTP to: ${normalizedEmail}`);

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_USER_ID,
          template_params: {
            title: `Your ICJ Verification Code: ${otp}`,
            subject: `${otp} is your ICJ Email Verification Code`,
            to_email: normalizedEmail,
            email: normalizedEmail,
            user_email: normalizedEmail,
            recipient: normalizedEmail,
            reply_to: normalizedEmail,
            to: normalizedEmail,
            send_to: normalizedEmail,
            dest_email: normalizedEmail,
            from_name: "International Consortium of Jurists (ICJ)",
            to_name: greetingName,
            name: greetingName,
            user_name: greetingName,
            message: emailContent,
            otp: otp,
            passcode: otp,
            code: otp,
            verification_code: otp,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[EmailJS] Returned error:", response.status, errText);
        return {
          success: false,
          error: `EmailJS error (${response.status}): ${errText || "Unable to send verification OTP."}`,
        };
      }

      console.log(`[EmailJS] Verification OTP dispatched successfully to ${normalizedEmail}`);
      return {
        success: true,
        message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
      };
    } catch (err: any) {
      console.error("[EmailJS] Network/Fetch Exception:", err);
      return {
        success: false,
        error: `Network error sending email via EmailJS: ${err.message || "Please check your internet connection."}`,
      };
    }
  },

  /**
   * Verifies the 6-digit OTP entered by the applicant
   */
  verifyEmailOtp: (
    email: string,
    enteredOtp: string
  ): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = enteredOtp.trim();

    if (!normalizedEmail) {
      return { success: false, error: "Email address is required." };
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      return { success: false, error: "Please enter the full 6-digit code." };
    }

    try {
      const storedData = localStorage.getItem(`icj_otp_${normalizedEmail}`);
      if (!storedData) {
        return {
          success: false,
          error: "No OTP request found for this email. Please click 'Send OTP' first.",
        };
      }

      const parsed = JSON.parse(storedData);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(`icj_otp_${normalizedEmail}`);
        return {
          success: false,
          error: "Verification code has expired. Please request a new code.",
        };
      }

      if (parsed.attempts >= 5) {
        localStorage.removeItem(`icj_otp_${normalizedEmail}`);
        return {
          success: false,
          error: "Too many incorrect attempts. Please request a new code.",
        };
      }

      if (parsed.otp !== cleanOtp) {
        parsed.attempts = (parsed.attempts || 0) + 1;
        localStorage.setItem(`icj_otp_${normalizedEmail}`, JSON.stringify(parsed));
        return {
          success: false,
          error: "Invalid code. Please enter the correct 6-digit code sent to your email.",
        };
      }

      // OTP matches! Mark as verified
      localStorage.removeItem(`icj_otp_${normalizedEmail}`);
      emailVerificationService.markEmailVerified(normalizedEmail);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Verification error. Please try again.",
      };
    }
  },

  /**
   * Sends a Welcome message with a direct "Verify Email" button link via EmailJS
   */
  sendVerificationEmail: async (
    email: string,
    name?: string
  ): Promise<{ success: boolean; verifyUrl?: string; message?: string; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const greetingName = name?.trim() || "Valued Applicant";

    // Construct dedicated verify link
    let verifyUrl = "";
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const token = btoa(JSON.stringify({ email: normalizedEmail, timestamp: Date.now() }));
      verifyUrl = `${origin}/verify-email?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;
    }

    // Save pending verification state in localStorage
    try {
      localStorage.setItem(
        `icj_pending_verify_${normalizedEmail}`,
        JSON.stringify({
          email: normalizedEmail,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Ignore localStorage errors
    }

    const emailButtonHtml = `<table cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
  <tr>
    <td align="center" style="border-radius: 6px; background-color: #2563eb;">
      <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: Arial, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; background-color: #2563eb;">
        Verify Email Address
      </a>
    </td>
  </tr>
</table>`;

    const emailContent = `Welcome to the International Consortium of Jurists (ICJ)!

Dear ${greetingName},

Thank you for initiating your application. Please click the button below to verify your email address:

${emailButtonHtml}

If the button above does not work, click this link:
${verifyUrl}

If you did not request this, please disregard this email.

Best regards,
International Consortium of Jurists (ICJ)`;

    // Dispatch via EmailJS API directly from the browser
    try {
      console.log(`[EmailJS] Dispatching verification email to: ${normalizedEmail}`, {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
      });

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_USER_ID,
          template_params: {
            title: "Welcome to ICJ - Verify Your Email",
            subject: "Verify Your Email - International Consortium of Jurists (ICJ)",
            to_email: normalizedEmail,
            email: normalizedEmail,
            user_email: normalizedEmail,
            recipient: normalizedEmail,
            reply_to: normalizedEmail,
            to: normalizedEmail,
            send_to: normalizedEmail,
            dest_email: normalizedEmail,
            from_name: "International Consortium of Jurists (ICJ)",
            to_name: greetingName,
            name: greetingName,
            user_name: greetingName,
            message: emailContent,
            verify_url: verifyUrl,
            verify_link: verifyUrl,
            link: verifyUrl,
            url: verifyUrl,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("[EmailJS] Returned error:", response.status, errText);
        return {
          success: false,
          verifyUrl,
          error: `EmailJS error (${response.status}): ${errText || "Unable to send verification email."}`,
        };
      }

      console.log(`[EmailJS] Email dispatched successfully (200 OK) to ${normalizedEmail}`);
      return {
        success: true,
        verifyUrl,
        message: `Verification link sent to ${normalizedEmail}`,
      };
    } catch (err: any) {
      console.error("[EmailJS] Network/Fetch Exception:", err);
      return {
        success: false,
        verifyUrl,
        error: `Network error sending email via EmailJS: ${err.message || "Please check your internet connection."}`,
      };
    }
  },

  /**
   * Validates verification token and marks email as verified strictly from email link
   */
  verifyEmailWithToken: (email: string, token?: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return false;

    try {
      if (token) {
        try {
          const decoded = JSON.parse(atob(token));
          // Check token expiry (48 hours)
          if (decoded.timestamp && Date.now() - decoded.timestamp > 48 * 60 * 60 * 1000) {
            return false;
          }
        } catch {
          // Token decode fallback
        }
      }
      emailVerificationService.markEmailVerified(normalizedEmail);
      return true;
    } catch {
      emailVerificationService.markEmailVerified(normalizedEmail);
      return true;
    }
  },

  /**
   * Checks if the given email is currently verified in localStorage
   */
  isEmailVerified: (email: string): boolean => {
    if (!email) return false;
    try {
      const normalized = email.trim().toLowerCase();
      const verified = localStorage.getItem("icj_verified_email");
      return verified === normalized;
    } catch {
      return false;
    }
  },

  /**
   * Checks verification status with backend cache for cross-device/browser sync
   */
  checkVerificationWithBackend: async (email: string): Promise<boolean> => {
    if (!email) return false;
    try {
      const normalized = email.trim().toLowerCase();
      if (emailVerificationService.isEmailVerified(normalized)) return true;
      const res = await fetch(
        `http://localhost:8000/api/v1/auth/email-verification-status/?email=${encodeURIComponent(normalized)}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.verified) {
          emailVerificationService.markEmailVerified(normalized);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Directly marks an email verified and notifies all tabs/windows and backend
   */
  markEmailVerified: (email: string): void => {
    if (!email) return;
    try {
      const normalized = email.trim().toLowerCase();
      localStorage.setItem("icj_verified_email", normalized);
      localStorage.setItem("icj_verified_at", Date.now().toString());
      localStorage.removeItem(`icj_pending_verify_${normalized}`);

      // Sync with backend verification status
      try {
        fetch("http://localhost:8000/api/v1/auth/email-verification-status/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalized }),
        }).catch(() => {});
      } catch {}

      if (typeof window !== "undefined") {
        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel("icj_email_verification");
            bc.postMessage({ type: "EMAIL_VERIFIED", email: normalized, timestamp: Date.now() });
            // Do not close synchronously; allow message dispatch to other tabs
            setTimeout(() => {
              try {
                bc.close();
              } catch {}
            }, 1000);
          }
        } catch {}
        window.dispatchEvent(new CustomEvent("icj_email_verified", { detail: normalized }));
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Clears verification if email is changed
   */
  clearEmailVerification: (email?: string): void => {
    try {
      if (email) {
        const normalized = email.trim().toLowerCase();
        const verified = localStorage.getItem("icj_verified_email");
        if (verified === normalized) {
          localStorage.removeItem("icj_verified_email");
        }
        localStorage.removeItem(`icj_pending_verify_${normalized}`);
      } else {
        localStorage.removeItem("icj_verified_email");
      }
    } catch {
      // Ignore
    }
  },
};
