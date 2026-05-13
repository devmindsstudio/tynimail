import { Button } from "@/components/ui/button";
import SliderForSignUp from "./slider";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaCheck } from "react-icons/fa6";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { useAuthentication } from "@/hooks/use-auth";
import CustomAlertError from "@/components/ui-custom/alert";

type FormData = {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");

  const { AUTH_REGISTER, saveRegisterToken } = useAuthentication();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  const onSubmit = (data: FormData) => {
    AUTH_REGISTER.mutate(
      {
        ...(data.name?.trim() ? { name: data.name } : {}),
        email: data.email,
        password: data.password,
      },
      {
        onError: (error) => {
          // toast.error(error?.message ?? "Something is wrong");
          setAlertErrorMessage(error.message);
        },
        onSuccess(data) {
          // console.log("data", data);
          navigate("/otp");
          const tokens = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
          saveRegisterToken(tokens);
          // toast.success(data.message);
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
          </div>
          <div className="overflow-x-hidden [scrollbar-width:none] h-max w-full">
            {/* <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-110 px-2.5 h-auto w-full mx-auto "
            ></form> */}
            {/* FORM START */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-110 px-2.5 h-max w-full mx-auto overflow-x-hidden [scrollbar-width:none]"
            >
              <h2 className="text-xl md:text-3xl font-semibold text-foreground">
                Create Your Account
              </h2>
              <p className="text-base text-muted-foreground font-normal mt-3 mb-8">
                Launch smarter, higher converting email campaigns
              </p>
              {alertErrorMessage && (
                <CustomAlertError
                  className="mb-3"
                  message={alertErrorMessage}
                />
              )}
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div className="row">
                  <Label htmlFor="name" className="mb-1.5">
                    Name (optional)
                  </Label>
                  <Input
                    type="text"
                    maxLength={15}
                    className="h-11"
                    placeholder="E.g Alex Hales"
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
                    className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                    type="email"
                    placeholder="E.g alex@example.com"
                    {...register("email", {
                      required: "Email is required",
                      maxLength: {
                        value: 50,
                        message: "Email must not exceed 50 characters",
                      },
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
                        //   message:
                        //     "Password must be at least 8 characters long",
                        // },
                        // maxLength: {
                        //   value: 64,
                        //   message: "Password must not exceed 12 characters",
                        // },
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                          message:
                            "Password must contain uppercase, lowercase, number, and special character",
                        },
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-[22px] -translate-y-1/2 text-gray-500"
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

                {/* Password Validation Indicators */}
                {/* <div className="row mt-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
                      isLengthValid
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
                      isLengthValid
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    Password must have 8 characters
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
                      hasNumberOrSpecial
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
                      hasNumberOrSpecial
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    Numbers or special characters
                  </p>
                </div>
              </div> */}
                {/* Password Validation Indicators */}
                {/* <div className="row mt-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
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

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
                      /[A-Z]/.test(passwordValue)
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
                      /[A-Z]/.test(passwordValue)
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    At least one uppercase letter
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
                      /[a-z]/.test(passwordValue)
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
                      /[a-z]/.test(passwordValue)
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    At least one lowercase letter
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
                      /\d/.test(passwordValue)
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
                      /\d/.test(passwordValue)
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    At least one number
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 flex justify-center items-center rounded-full ${
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
                      /[@$!%*?&]/.test(passwordValue)
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    At least one special character (@$!%*?&)
                  </p>
                </div>
              </div> */}
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

                  {/* Uppercase + Lowercase + Number */}
                  {/* <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 min-w-5 min-h-5 flex justify-center items-center rounded-full ${
                      /[A-Z]/.test(passwordValue) &&
                      /[a-z]/.test(passwordValue) &&
                      /\d/.test(passwordValue)
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
                      /\d/.test(passwordValue)
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    At least one uppercase letter , lowercase letter , number
                  </p>
                </div> */}

                  {/* Special Character */}
                  {/* <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`w-5 h-5 min-w-5 min-h-5 flex justify-center items-center rounded-full ${
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
                      /[@$!%*?&]/.test(passwordValue)
                        ? "text-green-600"
                        : errors.password
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    At least one special character (@$!%*?&)
                  </p>
                </div> */}
                  {/* Password Requirement: Uppercase + Lowercase + Number + Special Character */}
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
                      Must include uppercase, lowercase, number & special
                      (@$!%*?&)
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                size="lg"
                type="submit"
                disabled={AUTH_REGISTER.status === "pending"}
                className="w-full my-8 text-primary-foreground bg-primary h-10 text-base font-medium cursor-pointer"
              >
                Create Account
              </Button>

              <p className="text-base text-muted-foreground font-normal text-center">
                Already have an account?{" "}
                <Link to={"/login"} className="text-foreground font-medium">
                  Sign in
                </Link>
              </p>
              <p className="text-sm font-normal text-muted-foreground mt-8">
                By signing up, you agree to the Terms of Use, Privacy Notice, &
                Cookies Notice
              </p>
            </form>
            {/* FORM END */}
          </div>

          <p className="p-5 mx-auto md:mx-0 md:p-8 text-sm text-gray-500 font-inter font-normal">
            © TYNIMAIL
          </p>
        </div>

        {/* Right Side Image + Slider */}
        <div className="hidden md:block max-w-1/2 w-full p-6 rounded-xl h-screen overflow-hidden z-1 relative">
          <img
            className="w-full h-full rounded-xl object-cover object-center"
            src="/sign.jpg"
          />
          <SliderForSignUp />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
