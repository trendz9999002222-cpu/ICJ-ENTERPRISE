import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { Paper, Typography } from "@mui/material";

export const metadata = { title: "Reports — Admin Portal | ICJ Enterprise" };

export default function Page() {
  return (
    <AdminPageShell title="Reports" subtitle="Analytics, exports, and platform reports">
      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          textAlign: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#64748b", mb: 1 }}>
          Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This section is ready for implementation. Connect the Django REST API and
          add components here — the admin shell layout and navigation are fully functional.
        </Typography>
      </Paper>
    </AdminPageShell>
  );
}
