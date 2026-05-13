import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModelLayout from "@/pages/model/model-layout";
import { useForm } from "react-hook-form";

type FormValues = {
  email: string;
};
type VerificationType = "email" | "domain";

const Email = ({
  onClose,
  onVerify,
  disabled,
}: {
  onClose: any;
  onVerify: (type: VerificationType, value: string) => void;
  disabled: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    onVerify("email", data.email);
  };

  return (
    <ModelLayout>
      <div className="relative p-4">
        <div className="w-full max-w-106.25 bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8 text-foreground">
            Verify Email
          </h2>

          <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
            Verify your email to start sending. Check your inbox to complete the
            process.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
            <div>
              <Label htmlFor="email" className="mb-1.5">
                Email
              </Label>

              <Input
                type="email"
                id="email"
                placeholder="E.g john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-5 grid-cols-2 mt-10">
              <Button
                variant="outline"
                type="button"
                className="h-10"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={disabled} className="h-10">
                Start Verification
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModelLayout>
  );
};

export default Email;
