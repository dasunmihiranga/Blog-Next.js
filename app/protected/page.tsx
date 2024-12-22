import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect if no user is found
  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch blogs after checking authentication
  const { data: blogs } = await supabase.from("blog").select("*");

  return (
    <div className="flex-1 w-full flex flex-col gap-12 px-6 py-8">
      <div className="w-full mb-6">
        <input type="text" className="w-2/3 bg-gray h-10 rounded-2xl text-center" />
        <button className="text-white hover:bg-primary-dark font-bold py-2 px-4 rounded-md">
          Search
        </button>
      </div>

      <div>
        <h2 className="font-bold text-3xl mb-8 text-white">All Blogs</h2>

        {/* Blog Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {blogs?.map((blog) => (
            <div
              key={blog.id}
              className="bg-black p-10 border border-gray-400 rounded-lg transition-transform duration-300 transform hover:scale-105 hover:bg-gray-800"
            >
              <h3 className="text-2xl font-semibold text-white">{blog.title}</h3>
              <p
                className="mt-4 text-gray-200 whitespace-pre-wrap line-clamp-4"
                style={{
                  maxHeight: "8em",
                  overflow: "hidden",
                }}
              >
                {blog.content}
              </p>
              <div className="mt-6 flex justify-between">
                <a
                  href={`/blog/${blog.id}`}
                  className="text-primary hover:underline"
                >
                  Read More
                </a>
                {/* Show "Edit" button only if the logged-in user is the author */}
                {user?.email === blog.user_email && (
                  <button className="text-yellow-600 hover:underline">Edit</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
