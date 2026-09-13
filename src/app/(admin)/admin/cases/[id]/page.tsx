import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { Typography } from "@mui/material";

export const metadata = { title: "Case Detail — Admin Portal | ICJ Enterprise" };

type Props = { params: Promise<{ id: string }> };

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminPageShell title={`Case #${id}`} subtitle="Case profile, timeline, and documents">
      <Typography color="text.secondary" variant="body2">
        Detailed case view for ID: <strong>{id}</strong>. Case timeline, hearing dates,
        associated documents, and parties will be available when the Django REST API is connected.
      </Typography>
    </AdminPageShell>
  );
}
