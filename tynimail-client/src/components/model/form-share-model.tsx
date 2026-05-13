import ModelLayout from "@/pages/model/model-layout";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { hanlderCopyToClipboard } from "@/utils/copy-clipboard";

const FormShareModel = ({
  data,
  onClose,
}: {
  onClose: () => void;
  data: any;
}) => {
  const shareUrl = `${window.location.origin}/preview/${data?.id}/form`;
  return (
    <ModelLayout>
      <div className="relative p-4 mx-auto w-full flex justify-center">
        <div className="w-full max-w-106.25 bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="font-semibold text-2xl leading-8 text-foreground">
            Published Successfully
          </h2>
          <p className="text-xs leading-4 text-muted-foreground mt-1.5 pb-7">
            Your Survey is now live and ready to collect responses.
          </p>
          <div className="py-2.5 px-4 border border-input rounded-md relative mb-5">
            <p className="text-muted-foreground text-base leading-6">
              {shareUrl}
            </p>
            <span
              className="absolute right-4 top-2.5 bottom-0 cursor-pointer"
              onClick={() =>
                hanlderCopyToClipboard(`/preview/${data?.id}/form`)
              }
              // onClick={onHandleShare}
            >
              <Copy />
            </span>
          </div>
          {/* <div className="flex justify-between items-center mt-5 mb-11">
            <p className="text-foreground text-base leading-6">
              Share Your form Via
            </p>
            <ul className="flex justify-center items-center gap-3">
              <li
                onClick={() => hanlderCopyToClipboard("/forms-surveys")}
                className="w-10 h-10 flex justify-center items-center bg-[#007AB9] rounded-full cursor-pointer"
              >
                <Linkedin className="stroke-transparent fill-white " />
              </li>
              <li
                className="w-10 h-10 flex justify-center items-center bg-[#1877F2] rounded-full cursor-pointer"
                onClick={() => hanlderCopyToClipboard("/forms-surveys")}
              >
                <Facebook className="stroke-transparent fill-white" />
              </li>
              <li
                className="w-10 h-10 flex justify-center items-center bg-muted rounded-full cursor-pointer"
                onClick={() => hanlderCopyToClipboard("/forms-surveys")}
              >
                <Mail className="" />
              </li>
            </ul>
          </div> */}

          <Button className="h-10 w-full" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModelLayout>
  );
};

export default FormShareModel;
