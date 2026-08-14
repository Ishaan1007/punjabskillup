import { supabaseAdmin } from "../../lib/supabaseAdmin";
import AdminApp from "../../components/AdminApp";

export const revalidate = 0;

export default async function AdminPage() {
  const { data } = await supabaseAdmin.from("course_data").select("data").eq("id", 1).single();
  const courseData = data?.data || { tree: [], content: {} };
  return <AdminApp initialData={courseData} />;
}
