import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { useAuthentication } from "@/hooks/use-auth";

import NewTimer from "./new-timer";
import CustomAlertError from "@/components/ui-custom/alert";
type FormData = {
  name: string;
  email: string;
  password: string;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const {
    AUTH_LOGIN,
    saveAccessToken,
    saveRegisterToken,
    RESEND_EMAIL_VERIFICATION,
  } = useAuthentication();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    AUTH_LOGIN.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onError(error) {
          setAlertErrorMessage(error.message);
        },
        onSuccess(data) {
          const tokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };

          saveRegisterToken(tokens);
          if (data.isEmailVerified === 1) {
            navigate("/");
            saveAccessToken(tokens);
          } else if (data.isEmailVerified === 2) {
            RESEND_EMAIL_VERIFICATION.mutate(undefined, {
              onSuccess: (_) => {
                navigate("/otp");
              },
              onError: (error: any) => {
                setAlertErrorMessage(error.message);
              },
            });
          } else if (data.isEmailVerified === 3) {
            setAlertErrorMessage(
              "Your account has been suspended. Please contact the administrator."
            );
          }
          return;
        },
      }
    );
  };

  return (
    <div className="bg-background relative h-screen overflow-hidden md:before:content-[''] before:hidden md:before:absolute md:before:top-0 md:before:bottom-0 md:before:right-0 md:before:block md:before:w-1/2 md:before:bg-muted">
      <div className="max-w-tiny-mail mx-auto w-full flex justify-between items-center min-h-screen rounded-xl">
        <div className="md:max-w-1/2 w-full flex h-screen flex-col items-start justify-between">
          <div className="md:p-8 mx-auto md:mx-0 p-5">
            <img
              src="/Logo_Black.svg"
              alt=""
              className="w-auto max-w-max h-11 dark:hidden block"
            />
            <img
              src="/Logo_White.svg"
              alt=""
              className="w-auto max-w-max h-11 hidden dark:block"
            />
            {/* tyni-mail-white.svg */}
            {/* <img
              src="/tyni-mail.svg"
              alt=""
              className="w-auto max-w-max h-11"
            /> */}
          </div>

          {/* FORM START */}
          <div className="overflow-x-hidden [scrollbar-width:none] h-max w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-110 px-2.5 h-auto w-full mx-auto "
            >
              <h2 className="text-xl md:text-3xl font-semibold text-foreground">
                Login
              </h2>
              <p className="text-base text-muted-foreground font-normal mt-3 mb-8">
                Welcome Back!
              </p>
              {alertErrorMessage && (
                <CustomAlertError
                  className="mb-3"
                  message={alertErrorMessage}
                />
              )}
              <div className="grid grid-cols-1 gap-4">
                <div className="row">
                  <Label htmlFor="name" className="mb-1.5">
                    Name{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="E.g Alex Hales"
                    className="h-11"
                    maxLength={15} // restrict input length
                    {...register("name", {
                      validate: (value) =>
                        !value ||
                        /^[A-Za-z\s]*$/.test(value) ||
                        "Name can only contain letters and spaces",
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div className="row">
                  <Label htmlFor="email" className="mb-1.5">
                    Email
                  </Label>
                  <Input
                    maxLength={50}
                    className={`h-11 focus-visible:outline-none ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    type="email"
                    placeholder="E.g alex@example.com"
                    {...register("email", {
                      maxLength: {
                        value: 50,
                        message: "Email must not exceed 50 characters",
                      },
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

                {/* Password */}
                <div className="row relative">
                  <Label htmlFor="password" className="mb-1.5">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      maxLength={64}
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
                        // pattern: {
                        //   value: /^(?=.*[0-9!@#$%^&*]).{8,}$/,
                        //   message:
                        //     "Password must include a number or special character",
                        // },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[22px] -translate-y-1/2 text-gray-500"
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
                <div className="row mt-2.5 flex justify-between items-center">
                  <div className="flex justify-start items-center gap-3">
                    <Checkbox id="toggle" />
                    <Label htmlFor="toggle">Remember me</Label>
                  </div>
                  <Link
                    to="/forget-password?direct=true"
                    className="text-base text-muted-foreground font-normal text-center"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                size="lg"
                type="submit"
                disabled={AUTH_LOGIN.status === "pending"}
                className="w-full my-8 text-primary-foreground bg-primary h-10 text-base font-medium cursor-pointer"
              >
                Login
              </Button>

              <p className="text-base text-muted-foreground font-normal text-center ">
                Don’t have an account?{" "}
                <Link to={"/sign-up"} className="text-foreground font-medium">
                  Sign up
                </Link>
              </p>
            </form>
            {/* FORM END */}
          </div>

          <p className="p-5 mx-auto md:mx-0 md:p-8 text-sm text-gray-500 font-inter font-normal">
            © TYNIMAIL
          </p>
        </div>

        {/* Right Side Image + Slider */}
        {/* <div className="hidden md:block max-w-1/2 w-full p-6 rounded-xl h-screen overflow-hidden z-1 relative">
          <img
            className="w-full h-full rounded-xl object-cover object-center"
            src="/sign.jpg"
          />
        </div> */}
        <div className="hidden md:block max-w-1/2 w-full p-6 rounded-xl h-screen overflow-x-hidden z-1 relative ">
          <div className="flex flex-col justify-center items-center h-[-webkit-fill-available] [scrollbar-width:none]  py-10">
            {/* <div className=""> */}
            {/* <div className="flex flex-col justify-between items-center h-full py-10"> */}
            <div className="w-full">
              {/* <h2 className="font-pacifico font-normal text-foreground text-[64px] leading-[120%] tracking-[-2px] text-center capitalize"> */}
              <h2 className="font-bukhari font-normal text-foreground text-[64px] leading-[120%] tracking-[-2px] text-center capitalize">
                Hi {watch("name")?.trim()}
              </h2>
              <div className="relative">
                {/* <Clock /> */}
                <NewTimer />

                {/* <img
                  src="/Timer.png"
                  alt=""
                  className="h-auto max-h-44 w-auto mt-12 mx-auto"
                /> */}
              </div>
            </div>
            <img
              src="/login.png"
              alt=""
              className="h-auto dark:hidden block max-h-70"
            />

            {/*  */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
