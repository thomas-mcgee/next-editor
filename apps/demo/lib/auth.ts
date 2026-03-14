import { cookies } from "next/headers";
import { getUserById } from "@/lib/user-store";

const SESSION_COOKIE = "next_editor_demo_role";
const USER_COOKIE = "next_editor_demo_user";

export async function getEditorSession() {
  const cookieStore = await cookies();
  const role = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = cookieStore.get(USER_COOKIE)?.value;
  const user = userId ? await getUserById(userId) : null;
  const canAccessAdmin =
    (role === "editor" || role === "admin") && Boolean(user);
  const isAdmin = role === "admin" && Boolean(user);

  return {
    isEditor: canAccessAdmin,
    canAccessAdmin,
    isAdmin,
    role,
    userId,
    user,
  };
}

export { SESSION_COOKIE, USER_COOKIE };
