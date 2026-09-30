import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";

import ChangePasswordForm from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ChangePasswordForm />
    </Suspense>
  );
}
