import { Suspense } from "react";

import JoinMembershipApplicationFlow from "@/components/features/membership/JoinMembershipApplicationFlow";

export default function JoinMembershipPage() {
  return (
    <Suspense fallback={null}>
      <JoinMembershipApplicationFlow />
    </Suspense>
  );
}
