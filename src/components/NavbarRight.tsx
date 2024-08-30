import { buttonVariants } from "./ui/button";
import Cart from "./Cart";
import UserAccountNav from "./UserAccountNav";
import Link from "next/link";
import { User } from "@/payload-types";
import { cn } from "@/lib/utils";

const NavbarRight = ({ user, isTransparent,
  isHovered }: { user: User | null; isTransparent: boolean;
  isHovered: boolean; }) => {
  return (
    <div className="ml-auto flex items-center">
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
        {user ? null : (
          <Link
            href="/sign-in"
            className={cn(`${isTransparent && !isHovered ? "text-white" : "text-black"}`,buttonVariants({ variant: "ghost" }))}
          >
            Sign in
          </Link>
        )}

        {user ? null : (
          <span className={cn("h-6 w-px bg-gray-200", `${isTransparent && !isHovered ? "bg-gray-400" : "bg-gray-200"}`)} aria-hidden="true" />
        )}

        {user ? (
          <UserAccountNav user={user} />
        ) : (
          <Link href="sign-up" className={cn(`${isTransparent && !isHovered ? "text-white" : "text-black"}`,buttonVariants({ variant: "ghost" }))}>
            Create Account
          </Link>
        )}

        {user ? (
          <span className={cn("h-6 w-px bg-gray-200", `${isTransparent && !isHovered ? "bg-gray-400" : "bg-gray-200"}`)} aria-hidden="true" />
        ) : null}

        {user ? null : (
          <div className="flex lg:ml-6">
            <span className={cn("h-6 w-px bg-gray-200", `${isTransparent && !isHovered ? "bg-gray-400" : "bg-gray-200"}`)} aria-hidden="true" />
          </div>
        )}

        <div className="ml-4 flow-root lg:ml-6">
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default NavbarRight;
