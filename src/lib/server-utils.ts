import { getServerSideUser } from "@/lib/payload-utils";
import { cookies } from "next/headers";

export async function fetchUser() {
  const userCookies = cookies();
  const { user } = await getServerSideUser(userCookies);
  return user;
}
