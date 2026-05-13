import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthentication } from "@/hooks/use-auth";
import { ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { encryptValue } from "@/utils/encrypt-class";
import CustomAlertError from "@/components/ui-custom/alert";
import { useState } from "react";

type FormData = {
  email: string;
};
const ForgetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
  }>({
    mode: "onChange",
  });

  const { FORGET_PASSWORD } = useAuthentication();
  const navigate = useNavigate();
  const [alertErrorMessage, setAlertErrorMessage] = useState("");

  const [searchParams] = useSearchParams();
  const direct = searchParams.get("direct");
  const onSubmit = async (data: FormData) => {
    const email = data.email;

    const rawEncrypted = encryptValue(email);
    const urlSafeEncrypted = encodeURIComponent(rawEncrypted);
    FORGET_PASSWORD.mutate(email, {
      onSuccess: (_) => {
        if (direct) {
          navigate(`/otp?direct=true&k=${urlSafeEncrypted}`);
        } else {
          navigate(`/otp?k=${urlSafeEncrypted}`);
        }
        // toast.success(data.message || "OTP resent successfully");
      },
      onError: (error: any) => {
        setAlertErrorMessage(error.message);
        // toast.error(error.message || "Failed to resend OTP");
      },
    });
  };
  return (
    <div className="bg-muted">
      <div className="flex justify-center items-center h-screen">
        <div className="max-w-105 w-full bg-background p-6 rounded-2xl">
          <Button
            variant="outline"
            size="icon"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
          <h2 className="text-xl md:text-3xl font-semibold text-foreground mt-6">
            Forgot Password
          </h2>
          <p className="text-base text-muted-foreground font-normal mt-3 mb-8">
            A verification code will be sent to your email to reset your
            password.
          </p>
          {/* Email */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {alertErrorMessage && (
              <CustomAlertError className="mb-3" message={alertErrorMessage} />
            )}
            <div className="row">
              <Label htmlFor="email" className="mb-1.5">
                Email
              </Label>
              <Input
                className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                type="email"
                maxLength={50}
                placeholder="E.g alex@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value:
                      /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              size="lg"
              type="submit"
              disabled={FORGET_PASSWORD.status === "pending"}
              className="w-full mt-8 text-primary-foreground bg-primary h-10 text-base font-medium cursor-pointer"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
