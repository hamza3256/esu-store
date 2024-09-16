import { Loader2 } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="flex justify-center mt-5 items-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
};

export default PageLoader;
