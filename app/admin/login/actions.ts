"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password");

  if (password && password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("limak_admin", process.env.ADMIN_SESSION_TOKEN!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    redirect("/admin");
  }

  redirect("/admin/login?error=1");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("limak_admin");
  redirect("/admin/login");
}