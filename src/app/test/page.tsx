import { TestDashboard } from "@/components/TestDashboard";
import { getServerSideUser } from "@/lib/payload-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TestPage = async () => {
  const { user } = await getServerSideUser(cookies());

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-start gap-8 p-8">
      <h1 className="text-2xl font-bold">Performance Testing Dashboard</h1>
      <TestDashboard />
    </div>
  );
};

export default TestPage; 