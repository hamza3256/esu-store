import { getServerSideUser } from "@/lib/payload-utils"; 
import { cookies } from "next/headers"; 
import CartPageClient from "../../components/CartPageClient"; 

export default async function Page() {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  return <CartPageClient user={user} />;
}