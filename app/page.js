import { supabase } from "../lib/supabaseClient";
import Viewer from "../components/Viewer";

export const revalidate = 0;

export default async function HomePage() {
  if (!supabase) {
    return <Viewer initialData={{ tree: [], content: {} }} />;
  }

  const { data } = await supabase.from("course_data").select("data").eq("id", 1).single();
  const courseData = data?.data || { tree: [], content: {} };
  return <Viewer initialData={courseData} />;
}
