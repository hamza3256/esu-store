// lib/payload-utils.ts
import { User } from "../payload-types";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest } from "next/server";

export const getServerSideUser = async (
  cookies: NextRequest["cookies"] | ReadonlyRequestCookies
): Promise<{ user: User | null }> => {
  try {
    const token = cookies?.get("payload-token")?.value;

    if (!token) {
      // No token, return null
      return { user: null };
    }

    const meRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`,
      {
        headers: {
          Authorization: `JWT ${token}`,
        },
      }
    );

    if (!meRes.ok) {
      // Handle non-OK response
      console.error('Failed to fetch user:', meRes.statusText);
      return { user: null };
    }

    const { user } = (await meRes.json()) as { user: User };
    
    return { user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { user: null }; // Return null in case of error
  }
};
