import { Button } from "@/components/ui/button";
import ModelLayout from "@/pages/model/model-layout";

const DeleteModel = ({
  conform,
  modelCloseHandler,
  title = "",
  description = "",
  buttonTitle = "Delete Subscriber",
}: {
  conform: any;
  modelCloseHandler: any;
  title: any;
  description: any;
  buttonTitle: string;
}) => {
  return (
    <ModelLayout>
      <div className="relative p-4 w-full max-w-113">
        <div className="w-full bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8">
            {title}
          </h2>
          <p className="text-sm font-normal text-muted-foreground font-sans my-6">
            {description}
          </p>

          <div className="grid gap-5 grid-cols-2">
            <Button
              variant="outline"
              type="reset"
              className="h-10"
              onClick={modelCloseHandler}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-10"
              onClick={conform}
            >
              {buttonTitle}
            </Button>
          </div>
        </div>
      </div>
    </ModelLayout>
  );
};

export default DeleteModel;
