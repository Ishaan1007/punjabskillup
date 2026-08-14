import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminApp from "../../components/AdminApp";

export const revalidate = 0;

export default async function AdminPage() {
  if (!supabaseAdmin) {
    return <AdminApp initialData={{ tree: [], content: {} }} />;
  }

  const { data } = await supabaseAdmin.from("course_data").select("data").eq("id", 1).single();
  const courseData = data?.data || { tree: [], content: {} };
  return <AdminApp initialData={courseData} />;
}
