import { redirect } from "next/navigation";

export default function AdminAssistanceRedirect() {
  redirect("/admin/leads");
}
