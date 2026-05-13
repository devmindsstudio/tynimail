import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-tiny-mail w-full mx-auto">
      <div className="flex justify-center items-center flex-col h-screen">
        <h2 className="text-6xl font-bold text-gray-800 mb-4">404</h2>
        <p className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </p>
        <p className="text-muted  text-base">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="cursor-pointer"
        >
          Button
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
