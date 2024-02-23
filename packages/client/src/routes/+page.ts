import { redirect } from "@sveltejs/kit";

export const load = () => {
  try {
    redirect(307, "/welcome");
  } catch {
    return new Response("Redirecting...", { status: 307 });
  }
};
