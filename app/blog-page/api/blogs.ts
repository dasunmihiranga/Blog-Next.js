import { NextApiRequest, NextApiResponse } from "next";
import { createBlogPost } from "@/app/actions"; // import createBlogPost function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { title, content } = req.body;

    // Validate title and content
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    try {
      // Create blog post in Supabase
      const newBlog = await createBlogPost(title, content);
      res.status(201).json(newBlog); // Return the newly created blog post
    } catch (error) {
      res.status(500).json({ message: "Error creating blog post", error: (error as Error).message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" }); // For methods other than POST
  }
}
