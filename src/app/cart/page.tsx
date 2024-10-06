import { getServerSideUser } from "@/lib/payload-utils"; 
import { cookies } from "next/headers"; 
import CartPageClient from "../../components/CartPageClient"; 
import { getOperationalCities } from "../../lib/postex";

export default async function Page() {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  const cities = await getOperationalCities();

  return <CartPageClient user={user} cities={cities}/>;
}