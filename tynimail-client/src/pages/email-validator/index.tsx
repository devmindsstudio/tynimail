import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import toast from "react-hot-toast";

type FormValues = {
  email: string;
};

const EmailValidator = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    const url = `${import.meta.env.VITE_API_URL}${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/validate-email`;
    try {
      const reponse = await axios.post(url, {
        email: data.email,
      });

      const res = await reponse.data;

      if (res.valid) {
        toast.success("Email is valid");
      } else {
        toast.error("Email is invalid");
      }
    } catch (error: any) {
      console.log("error");
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-sidebar-backgdoud p-6 rounded-xl w-full max-w-[552px] mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-foreground font-semibold text-3xl leading-[38px]">
            Validate Your Email
          </h2>

          <div className="mt-6 mb-4">
            <Label className="mb-1.5">Email</Label>
            <Input
              type="email"
              placeholder="E.g johndoe@tynimail.com"
              className="h-10"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="" disabled={isSubmitting}>
              Validate
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailValidator;
