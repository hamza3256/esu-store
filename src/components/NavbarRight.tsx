import { buttonVariants } from "./ui/button";
import Cart from "./Cart";
import UserAccountNav from "./UserAccountNav";
import Link from "next/link";
import { User } from "@/payload-types";

const NavbarRight = ({ user }: { user: User }) => {
  return (
    <div className="ml-auto flex items-center">
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
        {user ? null : (
          <Link
            href="/sign-in"
            className={buttonVariants({ variant: "ghost" })}
          >
            Sign in
          </Link>
        )}

        {user ? null : (
          <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
        )}

        {user ? (
          <UserAccountNav user={user} />
        ) : (
          <Link href="sign-up" className={buttonVariants({ variant: "ghost" })}>
            Create Account
          </Link>
        )}

        {user ? (
          <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
        ) : null}

        {user ? null : (
          <div className="flex lg:ml-6">
            <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
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
