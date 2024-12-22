"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client"; // Import the Supabase client
const supabase = createClient(); // Create the Supabase client

const BlogPage = () => {
  const [blogs, setBlogs] = useState<
    Array<{ id: number; title: string; content: string; expanded: boolean; user_email: string }>
  >([]);
  const [newBlog, setNewBlog] = useState<{ title: string; content: string }>({ title: "", content: "" });
  const [editBlog, setEditBlog] = useState<{ id: number | null; title: string; content: string }>({
    id: null,
    title: "",
    content: "",
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Fetch blogs and user email on component mount
  useEffect(() => {
    const loadData = async () => {
      await getCurrentUserEmail();
      await fetchBlogs();
    };
    loadData(); // Run both functions
  }, []);

  const getCurrentUserEmail = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && user.email) {
      setCurrentUserEmail(user.email); // Set the user's email if it exists
    } else {
      setCurrentUserEmail(null); // Set to null if email is undefined or user is null
    }
  };

  const  fetchBlogs = async () => {
    if (currentUserEmail) {
      const { data, error } = await supabase
        .from("blog")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching blogs:", error);
        alert("Error fetching blogs. Check the console for details.");
      } else {
        // Filter blogs to show only the ones created by the current logged-in user
        setBlogs(data.filter((blog) => blog.user_email === currentUserEmail));
      }
    }
  };

  const toggleReadMore = (index: number) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog, i) => (i === index ? { ...blog, expanded: !blog.expanded } : blog))
    );
  };

  const addBlog = async () => {
    if (!currentUserEmail) {
      alert("You must be logged in to add a blog post.");
      return;
    }

    if (newBlog.title.trim() && newBlog.content.trim()) {
      const { data, error } = await supabase
        .from("blog")
        .insert([
          {
            title: newBlog.title.trim(),
            content: newBlog.content.trim(),
            user_email: currentUserEmail, // Insert the current logged-in user's email
          },
        ]);

      if (error) {
        console.error("Error adding blog:", error);
        alert(`Error adding blog: ${error.message}`);
      } else {
        fetchBlogs(); // Refresh blogs after adding
        setNewBlog({ title: "", content: "" }); // Clear form inputs
      }
    } else {
      alert("Please fill in both the title and content fields.");
    }
  };

  const startEditBlog = (blog: { id: number; title: string; content: string }) => {
    setEditBlog(blog);
  };

  const cancelEdit = () => {
    setEditBlog({ id: null, title: "", content: "" });
  };

  const updateBlog = async () => {
    if (editBlog.id && editBlog.title.trim() && editBlog.content.trim()) {
      const { data, error } = await supabase
        .from("blog")
        .update({ title: editBlog.title.trim(), content: editBlog.content.trim() })
        .eq("id", editBlog.id);
      if (error) {
        console.error("Error updating blog:", error);
        alert(`Error updating blog: ${error.message}`);
      } else {
        fetchBlogs(); // Refresh blogs after updating
        cancelEdit();
      }
    } else {
      alert("Please fill in both the title and content fields.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-6">Your Blogs</h1>

        {/* Add Blog Form */}
        <div className="mb-8 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Add a New Blog</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Blog Title"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Blog Content"
              value={newBlog.content}
              onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            ></textarea>
            <button
              onClick={addBlog}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Add Blog
            </button>
          </div>
        </div>

        {/* Edit Blog Form */}
        {editBlog.id && (
          <div className="mb-8 p-6 rounded-lg shadow-md bg-gray-800">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Edit Blog</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Blog Title"
                value={editBlog.title}
                onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Blog Content"
                value={editBlog.content}
                onChange={(e) => setEditBlog({ ...editBlog, content: e.target.value })}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              ></textarea>
              <div className="flex space-x-4">
                <button
                  onClick={updateBlog}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
                >
                  Update Blog
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display Blogs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-black p-6 border border-gray-400 rounded-lg transition duration-300 overflow-hidden"
            >
              <h3 className="text-xl font-semibold text-white">{blog.title}</h3>
              <p
                className={`mt-3 text-gray-200 whitespace-pre-wrap ${blog.expanded ? "line-by-line" : "truncate-ellipsis"}`}
                style={{
                  display: "block",
                  maxHeight: blog.expanded ? "none" : "3em",
                  overflow: blog.expanded ? "visible" : "hidden",
                }}
              >
                {blog.content}
              </p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => toggleReadMore(blogs.indexOf(blog))}
                  className="text-blue-600 hover:underline"
                >
                  {blog.expanded ? "Show Less" : "Read More"}
                </button>
                {/* Show "Edit" button only if the logged-in user is the author */}
                {currentUserEmail && blog.user_email === currentUserEmail && (
                  <button
                    onClick={() => startEditBlog(blog)}
                    className="text-yellow-600 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

