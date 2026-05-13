import CustomAlertError from "@/components/ui-custom/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthentication } from "@/hooks/use-auth";
import { decryptValue } from "@/utils/encrypt-class";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router";

type FormData = {
  password: string;
  confirmPassword: string;
};
const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { RESET_PASSWORD, logout } = useAuthentication();
  const [searchParams] = useSearchParams();
  const encryptedEmail = searchParams.get("k");
  const [alertErrorMessage, setAlertErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

  const navigate = useNavigate();
  const decodedEncryptedEmail = encryptedEmail
    ? decodeURIComponent(encryptedEmail)
    : null;
  const email = decodedEncryptedEmail
    ? decryptValue(decodedEncryptedEmail)
    : null;

  const onSubmit = (data: FormData) => {
    if (!email) {
      return;
    }

    RESET_PASSWORD.mutate(
      { email: email, newPassword: data.password },
      {
        onError(error) {
          // toast.error(error.message);
          setAlertErrorMessage(error.message);
        },
        onSuccess(_) {
          logout();
          // toast.success(data.message);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        },
      }
    );
  };
  const passwordValue = watch("password", "");

  return (
    <div className="bg-muted">
      <div className="flex justify-center items-center min-h-screen">
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
            Create a New Password
          </h2>
          <p className="text-base text-muted-foreground font-normal mt-3 mb-8">
            Choose a strong password to secure your account.
          </p>
          {alertErrorMessage && (
            <CustomAlertError className="mb-3" message={alertErrorMessage} />
          )}
          {/* Email */}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
            {/* Password */}
            <div className="row relative">
              <Label htmlFor="password" className="mb-1.5">
                Password
              </Label>
              <div className="relative">
                <Input
                  maxLength={64}
                  minLength={8}
                  className={`h-11 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    // minLength: {
                    //   value: 8,
                    //   message: "Password must be at least 8 characters long",
                    // },
                    // maxLength: {
                    //   value: 64,
                    //   message: "Password must not exceed 64 characters",
                    // },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                      message:
                        "Password must contain uppercase, lowercase, number, and special character",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="row relative">
              <Label htmlFor="confirmPassword" className="mb-1.5">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  maxLength={64}
                  minLength={8}
                  className={`h-11 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    // maxLength: {
                    //   value: 12,
                    //   message: "Password must not exceed 12 characters",
                    // },
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="row mt-2">
              {/* Length */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 min-w-5 min-h-5 flex justify-center items-center rounded-full ${
                    passwordValue.length >= 8
                      ? "bg-green-500 text-white"
                      : errors.password
                      ? "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <FaCheck size={12} />
                </span>
                <p
                  className={`text-sm font-normal ${
                    passwordValue.length >= 8
                      ? "text-green-600"
                      : errors.password
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  At least 8 characters
                </p>
              </div>

              {/* Uppercase + Lowercase + Number + Special Character */}
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`w-5 h-5 min-w-5 min-h-5 flex justify-center items-center rounded-full ${
                    /[A-Z]/.test(passwordValue) &&
                    /[a-z]/.test(passwordValue) &&
                    /\d/.test(passwordValue) &&
                    /[@$!%*?&]/.test(passwordValue)
                      ? "bg-green-500 text-white"
                      : errors.password
                      ? "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <FaCheck size={12} />
                </span>
                <p
                  className={`text-sm font-normal ${
                    /[A-Z]/.test(passwordValue) &&
                    /[a-z]/.test(passwordValue) &&
                    /\d/.test(passwordValue) &&
                    /[@$!%*?&]/.test(passwordValue)
                      ? "text-green-600"
                      : errors.password
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  Must include uppercase, lowercase, number & special (@$!%*?&)
                </p>
              </div>
            </div>
            <Button
              size="lg"
              type="submit"
              disabled={RESET_PASSWORD.status === "pending"}
              className="w-full text-primary-foreground bg-primary h-10 text-base font-medium cursor-pointer"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
