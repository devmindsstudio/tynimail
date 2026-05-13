import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import Countdown, { zeroPad } from "react-countdown";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuthentication } from "@/hooks/use-auth";

import { decryptValue } from "@/utils/encrypt-class";
import CustomAlertError from "@/components/ui-custom/alert";
import { useState } from "react";

type FormData = {
  otp: string;
};

const OTPScreen = () => {
  const navigate = useNavigate();
  const {
    VERIFY_EMAIL_OTP,
    RESEND_EMAIL_VERIFICATION,
    FORGET_PASSWORD,
    VERIFY_PASSWORD_OTP,
    getRegisterToken,
    saveAccessToken,
  } = useAuthentication();
  const [searchParams] = useSearchParams(); // React Router built-in
  const encryptedEmail = searchParams.get("k");
  const direct = searchParams.get("direct");
  const [alertErrorMessage, setAlertErrorMessage] = useState("");

  const decodedEncryptedEmail = encryptedEmail
    ? decodeURIComponent(encryptedEmail)
    : null;
  const email = decodedEncryptedEmail
    ? decryptValue(decodedEncryptedEmail)
    : null;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    if (email && direct) {
      VERIFY_PASSWORD_OTP.mutate(
        {
          email: email,
          otp: data.otp,
        },
        {
          onError(error) {
            // console.log("err", error);
            // toast.error(error.message);
            setAlertErrorMessage(error.message);
          },
          onSuccess(_) {
            // toast.success(data.message);
            // navigate("/");
            if (direct) {
              // navigate(`/reset-password?email=${encryptedEmail}`);
              if (encryptedEmail) {
                navigate(
                  `/reset-password?k=${encodeURIComponent(encryptedEmail)}`
                );
              }

              // email=
              return;
            }
            navigate("/");
          },
        }
      );
      return;
    } else {
      VERIFY_EMAIL_OTP.mutate(data.otp, {
        onError(error) {
          // console.log("error", error, getRegisterToken);
          // toast.error(error.message);
          setAlertErrorMessage(error.message);
        },
        onSuccess(_) {
          if (getRegisterToken) {
            saveAccessToken({
              accessToken: getRegisterToken.accessToken,
              refreshToken: getRegisterToken?.refreshToken,
            });
          }
          // toast.success(data.message);
          navigate("/");
        },
      });
    }
  };

  const resendEmailVerification = () => {
    RESEND_EMAIL_VERIFICATION.mutate(undefined, {
      onSuccess: (_) => {
        // toast.success(data.message || "OTP resent successfully");
      },
      onError: (error: any) => {
        // toast.error(error.message || "Failed to resend OTP");
        setAlertErrorMessage(error.message);
      },
    });
  };

  const sendPasswordReset = () => {
    if (!email) {
      return setAlertErrorMessage("Please again sent forget password");
      // return toast.error("Please again sent forget password");
    }

    FORGET_PASSWORD.mutate(email, {
      onError(error) {
        // console.log("error", error);
        setAlertErrorMessage(error.message);
      },
      onSuccess(_) {
        // console.log("data", data);
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
            Check your inbox
          </h2>
          <p className="text-base text-muted-foreground font-normal mt-3 mb-8">
            We’ve sent a 6-digit OTP to your email. Enter it below to verify
            your account.
          </p>
          {alertErrorMessage && (
            <CustomAlertError className="mb-3" message={alertErrorMessage} />
          )}
          {/* OTP Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row mb-3">
              <Label htmlFor="otp" className="mb-1.5">
                One time password
              </Label>

              <Controller
                name="otp"
                control={control}
                rules={{
                  required: "OTP is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "OTP must be 6 digits",
                  },
                }}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    className="w-full"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full"
                    >
                      <InputOTPGroup className="">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="w-[calc(372px/6)] h-10"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </InputOTP>
                )}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground font-normal ">
              OTP Expires in{" "}
              <span className="text-foreground">
                <Countdown
                  date={Date.now() + 2 * 60 * 1000} // 2 minutes from now
                  renderer={({ minutes, seconds }) => (
                    <>
                      {zeroPad(minutes)}:{zeroPad(seconds)}
                    </>
                  )}
                  onComplete={() => {
                    console.log("OTP expired");
                    // You can also disable the input or enable resend button here
                  }}
                />
              </span>
            </p>
            <Button
              size="lg"
              type="submit"
              disabled={VERIFY_EMAIL_OTP.status === "pending"}
              className="w-full my-8 text-primary-foreground bg-primary h-10 text-base font-medium cursor-pointer"
            >
              Verify
            </Button>

            <p className="text-base text-muted-foreground font-normal flex justify-center items-center">
              Didn’t receive the code? &nbsp;
              {email && direct ? (
                <Label
                  htmlFor="otp"
                  className="cursor-pointer"
                  onClick={sendPasswordReset}
                >
                  Resend
                </Label>
              ) : (
                <Label
                  htmlFor="otp"
                  className="cursor-pointer"
                  onClick={resendEmailVerification}
                >
                  Resend
                </Label>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPScreen;
