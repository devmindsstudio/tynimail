import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModelLayout from "@/pages/model/model-layout";

const AddIndividual = ({ onClose }: { onClose: () => void }) => {
  return (
    <ModelLayout>
      <div className="p-4 w-full max-w-133">
        <div className=" bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8">
            Add Individual Email
          </h2>
          <p className="text-sm font-normal text-muted-foreground mt-1.5">
            Fill in the details below to add a email.{" "}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-6">
            <Label htmlFor="email" className="capitalize">
              Email Address
            </Label>
            <div className="flex flex-col w-full mt-1.5">
              <Input
                type="text"
                id="email"
                placeholder="Email Address"
                // {...register("name", {
                //   required: "Name is required",
                //   pattern: {
                //     value: /^[A-Za-z\s]+$/, // Only letters and spaces
                //     message: "Only letters are allowed",
                //   },
                //   minLength: { value: 2, message: "Minimum 2 characters" },
                //   maxLength: { value: 50, message: "Maximum 50 characters" },
                // })}
              />
              {/* {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </span>
              )} */}
            </div>
            <div className="grid gap-5 grid-cols-2 mt-6">
              <Button variant="outline" type="reset" className="h-10" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="h-10">
                Add Record
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ModelLayout>
  );
};

export default AddIndividual;
