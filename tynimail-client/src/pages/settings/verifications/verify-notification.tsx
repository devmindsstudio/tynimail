import { Button } from "@/components/ui/button";
import { useEmails } from "@/hooks/use-emails";
import ModelLayout from "@/pages/model/model-layout";
import toast from "react-hot-toast";

const VerifyNotification = ({
  value,
  onClose,
  type,
}: {
  value: string | null;
  onClose: any;
  type: string;
}) => {
  const { SENDER_EMAIL_VERIFICATION } = useEmails();

  const verifyHanlder = () => {
    console.log("type", type);
    if (!value) return toast.error("Email is requried for verification");
    SENDER_EMAIL_VERIFICATION.mutate(
      {
        email: value,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess(data) {
          // if (data.success) {

          // }
          toast.success(data.message);
          onClose();
        },
      },
    );
  };
  return (
    <ModelLayout>
      <div className="relative p-4">
        <div className="w-full max-w-106.25 bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8 text-foreground">
            Check Your Inbox
          </h2>

          <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
            Verification link sent to{" "}
            <span className="font-semibold text-foreground">{value}</span> Click
            the link to confirm and complete verification.
          </p>

          <div className="mt-5 mb-3 flex flex-col gap-5">
            <Button
              onClick={verifyHanlder}
              disabled={SENDER_EMAIL_VERIFICATION.status === "pending"}
              className="w-full h-10"
            >
              Verify
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              className="w-full h-10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </ModelLayout>
  );
};

export default VerifyNotification;
