import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdOutlineStarBorder, MdLabelImportantOutline } from "react-icons/md";
// import { IoStar } from "react-icons/io5";
import { MdOutlineStar, MdLabelImportant } from "react-icons/md";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext, Controller } from "react-hook-form";
import { useEmails } from "@/hooks/use-emails";
import { Link } from "react-router";

const ComapingSetup = () => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const { GET_ALL_EMAILS } = useEmails();
  const { data, isLoading, isError, error } = GET_ALL_EMAILS({
    verified: true,
  });

  return (
    <div className="bg-muted p-4 lg:p-6 flex justify-between items-center rounded-[10px] gap-2.5 md:flex-row flex-col">
      <div className="w-full max-w-126">
        <h2 className="text-foreground text-xl lg:text-3xl leading-10 mb-4 lg:mb-6 font-semibold">
          Set Up Campaign
        </h2>
        <div className="grid gap-4">
          <div className="">
            <Label htmlFor="">Sender Name</Label>
            <p className="mb-1.5 text-xs leading-4 font-normal text-muted-foreground font-inter">
              The name your emails will come from
            </p>
            <Input
              placeholder="Alex Hales"
              {...register("sender_name", {
                required: "Sender name is required",
              })}
            />
            {errors.sender_name && (
              <p className="text-destructive text-xs mt-1">
                {errors.sender_name.message as string}
              </p>
            )}
          </div>
          <div className="">
            <Label htmlFor="">Subject Line</Label>
            <p className="mb-1.5 text-xs leading-4 font-normal text-muted-foreground font-inter">
              Title of your email shown in the inbox.{" "}
            </p>
            <Input
              placeholder="Blessed Friday"
              {...register("subject_line", {
                required: "Subject line is required",
              })}
            />
            {errors.subject_line && (
              <p className="text-destructive text-xs mt-1">
                {errors.subject_line.message as string}
              </p>
            )}
          </div>
          <div className="">
            <Label htmlFor="">Preheader Text (Optional) </Label>
            <p className="mb-1.5 text-xs leading-4 font-normal text-muted-foreground font-inter">
              Title of your Placeholder shown in the inbox.
            </p>
            <Input
              {...register("preheader_text")}
              placeholder="Your favorite deals are finally here — save big this Blessed Friday!"
            />
          </div>
          <div className="">
            <div className="flex justify-between items-center">
              <div>
                <Label htmlFor="">Sender Email Address </Label>
                <p className="mb-1.5 text-xs leading-4 font-normal text-muted-foreground font-inter">
                  Email address used to send and get replies
                </p>
              </div>
              <div>
                <Link to="/settings/account">
                  <Button variant="outline" className="!text-foreground">
                    Manage Email
                  </Button>
                </Link>
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-1">
                <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : isError ? (
              <p className="text-destructive text-xs mt-1">{error.message}</p>
            ) : (
              <Controller
                name="sender_email"
                control={control}
                rules={{
                  required: "Email address is required",
                }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select a email" />
                    </SelectTrigger>
                    <SelectContent>
                      {data && data.senderEmails.length > 0 ? (
                        <SelectGroup>
                          {data.senderEmails.map((emailObj: any) => (
                            <SelectItem key={emailObj.id} value={emailObj.id}>
                              {emailObj.email}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">
                          No sender emails available. Please add one.
                        </div>
                      )}
                      {/* <SelectGroup>
                        {[
                          "apple@example.com",
                          "banana.user@gmail.com",
                          "cherry.dev@yahoo.com",
                          "mango.support@outlook.com",
                          "peach.admin@example.org",
                          "berry.team@gmail.com",
                          "grape.service@mail.com",
                          "orange.contact@example.net",
                          "kiwi.office@gmail.com",
                          "melon.staff@example.com",
                        ].map((email, index) => (
                          <SelectItem key={index} value={email}>
                            {email}
                          </SelectItem>
                        ))}
                      </SelectGroup> */}
                    </SelectContent>
                  </Select>
                )}
              />
            )}

            {errors.sender_email && (
              <p className="text-destructive text-xs mt-1">
                {errors.sender_email.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="w-full max-w-115">
        <h2 className="font-medium text-sm text-primary mb-2">Inbox Preview</h2>
        <div className="border border-border  rounded-[10px] overflow-hidden">
          <div className="flex justify-between items-center p-3 gap-2 bg-zinc-100 dark:bg-zinc-900">
            <MdOutlineStarBorder className="h-[22px] w-[22px] min-h-[22px] min-w-[22px] fill-input" />
            <MdLabelImportantOutline className="h-[22px] w-[22px] min-h-[22px] min-w-[22px] fill-input" />
            <div className="w-full max-w-[102px] h-1 bg-input"></div>
            <div className="w-full max-w-full  h-1 bg-input ml-2"></div>
          </div>

          <div className="flex justify-between items-center p-3 gap-2 border-t bg-background border-input">
            <MdOutlineStar className="h-[22px] w-[22px] min-h-[22px] min-w-[22px]  dark:fill-primary" />
            <MdLabelImportant className="h-[22px] w-[22px] min-h-[22px] min-w-[22px] fill-[#EEDD48] dark:fill-[#FFED00]" />
            <h2 className="text-foreground font-inter text-sm font-normal w-full max-w-25 line-clamp-1">
              {watch("sender_name")}
            </h2>
            <p className="text-foreground font-inter text-sm font-normal w-full line-clamp-1">
              <span className="font-medium"> {watch("subject_line")}</span> -{" "}
              {watch("preheader_text")}
            </p>
          </div>
          {Array.from({ length: 6 }).map((_, index) => {
            return (
              <div
                key={index}
                className="flex justify-between items-center p-3 gap-2 border-t border-border bg-zinc-100 dark:bg-zinc-900"
              >
                <MdOutlineStarBorder className="h-[22px] w-[22px] min-h-[22px] min-w-[22px] fill-input " />
                <MdLabelImportantOutline className="h-[22px] w-[22px] min-h-[22px] min-w-[22px] fill-input" />
                <div className="w-full max-w-[102px] h-1 bg-input"></div>
                <div className="w-full max-w-full  h-1 bg-input ml-2"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComapingSetup;
