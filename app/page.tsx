import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch all blogs
  const { data: blogs } = await supabase.from("blog").select("*");

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4 py-8">
        {/* Check if environment variables are configured */}
        {!hasEnvVars ? (
          <div className="bg-yellow-200 p-4 rounded-lg text-yellow-800 mb-6">
            Please configure Supabase to proceed.
          </div>
        ) : (
          <>
            {/* Display the blogs */}
            <div>
              <h2 className="font-bold text-3xl mb-8 text-white">All Blogs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-8">
                {blogs?.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-black p-8 border border-gray-400 rounded-lg transition-transform duration-300 overflow-hidden hover:scale-105 hover:shadow-xl"
                  >
                    <h3 className="text-2xl font-semibold text-white mb-4">{blog.title}</h3>
                    <p
                      className="text-gray-200 whitespace-pre-wrap line-clamp-4"
                      style={{
                        maxHeight: "8em",
                        overflow: "hidden",
                      }}
                    >
                      {blog.content}
                    </p>
                    <div className="mt-6 flex justify-between items-center">
                      <a
                        href={`/blog/${blog.id}`}
                        className="text-primary hover:underline text-lg"
                      >
                        Read More
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
