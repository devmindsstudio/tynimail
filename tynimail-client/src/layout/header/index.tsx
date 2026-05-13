// import { LuBell } from "react-icons/lu";
// import { FiZap } from "react-icons/fi";
import { useAuthentication } from "@/hooks/use-auth";
// import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Header = () => {
  const { logout } = useAuthentication();

  return (
    <>
      <div className="px-8 py-4 border-b border-border bg-whit">
        <ul className="flex justify-end items-center gap-4">
          <li>
            <ModeToggle />
          </li>
          {/* <li>
            <Button variant="outline" className="h-10 rounded-lg">
              <FiZap size={20} />
              <p className="font-inter text-sm font-semibold">Upgrade now</p>
            </Button>
          </li>
          <li>
            <Button
              variant="outline"
              className="w-10 h-10 min-w-10 max-h-10 rounded-full border-0 hover:border-border"
            >
              <LuBell className="size-5" />
            </Button>
          </li> */}
          <li>
            <div
              className="w-10 h-10 rounded-full overflow-hidden"
              onClick={() => logout()}
            >
              <img
                src="/image.jpg"
                alt=""
                className="w-full h-full object-cover "
              />
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
