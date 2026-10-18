import { redirect } from "next/navigation";

export default function AdminCasesRedirect() {
  redirect("/admin/leads");
}
