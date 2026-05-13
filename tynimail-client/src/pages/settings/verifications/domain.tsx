import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModelLayout from "@/pages/model/model-layout";
import { useForm } from "react-hook-form";
type FormValues = {
  domain: string;
};
type VerificationType = "email" | "domain";

const Domain = ({
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
    onVerify("domain", data.domain);
  };

  return (
    <ModelLayout>
      <div className="relative p-4">
        <div className="w-full max-w-106.25 bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8 text-foreground">
            Verify Domain
          </h2>
          <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
            Verify your domain to send emails from it. Access to DNS settings is
            required.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
            <div>
              <Label htmlFor="email" className="mb-1.5">
                Email
              </Label>

              <Input
                type="text"
                id="domain"
                placeholder="E.g example.com"
                {...register("domain", {
                  required: "Domain is required",
                  pattern: {
                    value: /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,11}?$/,
                    message: "Enter a valid domain",
                  },
                })}
              />
              {errors.domain && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.domain.message}
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

              <Button type="submit" className="h-10" disabled={disabled}>
                Start Verification
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModelLayout>
  );
};

export default Domain;
