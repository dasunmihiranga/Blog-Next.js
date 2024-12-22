"use server";
import bcrypt from "bcryptjs"; 
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Function to create a new blog post
export const createBlogPost = async (title: string, content: string) => {
  const supabase = await createClient();  // Initialize Supabase client

  // Insert new blog post into the 'blog' table in Supabase
  const { data, error } = await supabase
    .from("blog") // the blog table
    .insert([
      {
        title,
        content,
      },
    ]);

  if (error) {
    console.error("Error inserting blog post:", error);
    throw new Error(`Failed to create blog post: ${error.message}`);
  }

  return data; // Return the newly created blog post data
};

// Function to get user details based on email
export const getUserDetails = async (email: string) => {
  const supabase = await createClient();

  // Get the current session using getSession()
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error("Error fetching session:", sessionError?.message);
    return null;
  }

  // Query the 'users' table using the email to get user details
  const { data, error } = await supabase
    .from("users") // your custom users table
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    console.error("Error fetching user details:", error?.message);
    return null;
  }

  console.log("User details:", data); // Log the user data
  return data;
};

// Sign-up action to create a user
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const firstName = formData.get("first_name")?.toString();
  const lastName = formData.get("last_name")?.toString();

  // Ensure the Supabase client is initialized
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Validate required input fields
  if (!email || !password || !firstName || !lastName) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email, password, and names are required"
    );
  }

  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing up: ", error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // Hash the password before saving to the custom table
  const hashedPassword = await bcrypt.hash(password, 10); // Hashing password with salt rounds (10 is a common value)

  // Insert user details into custom 'users' table (including hashed password)
  const user = data?.user;
  if (user) {
    const { error: insertError } = await supabase
      .from("users") // your custom table
      .insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          password: hashedPassword, // Store hashed password
        },
      ]);

    if (insertError) {
      console.error("Error inserting user data: ", insertError.message);
      return encodedRedirect("error", "/sign-up", "Failed to save user details");
    }

    // If sign-up and data insertion are successful
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }

  // If user creation failed, show an error message
  return encodedRedirect("error", "/sign-up", "Something went wrong during sign-up.");
};

// Sign-in action to authenticate a user
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-in", "Email and password are required");
  }

  // Attempt to sign in the user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData) {
    return encodedRedirect("error", "/sign-in", "Invalid credentials");
  }

  // Once signed in, get user details
  const userDetails = await getUserDetails(email);

  if (!userDetails) {
    return encodedRedirect("error", "/sign-in", "User details not found");
  }

  console.log("User successfully signed in:", userDetails);

  // Continue with the next steps (e.g., storing session, redirecting to a protected page)
  return redirect("/blog-page"); // or any protected page after sign-in
};

// Forgot password action to send reset email
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

// Reset password action to update user's password
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

// Sign-out action to log out the user
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
