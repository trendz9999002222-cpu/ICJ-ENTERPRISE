"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function MandatorySetPasswordGate({ children }: Props) {
  useEffect(() => {
    // Clear any leftover password change flags in storage
    try {
      localStorage.removeItem("icj_password_change_required");
    } catch {
      // ignore
    }
  }, []);

  return <>{children}</>;
}
