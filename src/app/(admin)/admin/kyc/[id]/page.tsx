import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { Typography } from "@mui/material";

export const metadata = { title: "KYC Detail — Admin Portal | ICJ Enterprise" };

type Props = { params: Promise<{ id: string }> };

export default async function KycDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminPageShell title={`KYC Application #${id}`} subtitle="Full application detail and document review">
      <Typography color="text.secondary" variant="body2">
        Full KYC detail view for application ID: <strong>{id}</strong>.
        Individual application detail page will be available when the Django REST API is connected.
      </Typography>
    </AdminPageShell>
  );
}
