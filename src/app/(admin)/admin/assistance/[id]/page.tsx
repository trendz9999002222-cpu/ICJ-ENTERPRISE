import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { Typography } from "@mui/material";

export const metadata = { title: "Assistance Detail — Admin Portal | ICJ Enterprise" };

type Props = { params: Promise<{ id: string }> };

export default async function AssistanceDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminPageShell title={`Assistance Request #${id}`} subtitle="Full assistance request details">
      <Typography color="text.secondary" variant="body2">
        Detailed assistance request view for ID: <strong>{id}</strong>.
        Request details, correspondence, and status updates will appear when the Django REST API is connected.
      </Typography>
    </AdminPageShell>
  );
}
