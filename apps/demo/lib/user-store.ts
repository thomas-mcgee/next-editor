import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

const usersPath = path.join(process.cwd(), "data", "users.json");

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  title?: string;
};

type UserFile = Record<string, DemoUser>;

async function readUsersFile() {
  const raw = await fs.readFile(usersPath, "utf8");
  return JSON.parse(raw) as UserFile;
}

export async function listUsers() {
  noStore();
  return Object.values(await readUsersFile());
}

export async function getUserById(userId: string) {
  noStore();
  const users = await readUsersFile();
  return users[userId] ?? null;
}

export async function getUserByEmail(email: string) {
  noStore();
  const users = await readUsersFile();
  return (
    Object.values(users).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    ) ?? null
  );
}

export async function updateUser(
  userId: string,
  values: Pick<DemoUser, "name" | "email" | "title">,
) {
  const users = await readUsersFile();
  const existing = users[userId];

  if (!existing) {
    throw new Error(`Missing user "${userId}".`);
  }

  users[userId] = {
    ...existing,
    ...values,
  };

  await fs.writeFile(usersPath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  return users[userId];
}
