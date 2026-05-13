import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddSubsciberModel from "@/pages/subscribers/add-subsciber-model";
import SegmentDropdown from "./segment-dropdown";

const ChooseAudience = () => {
  const { control, watch } = useFormContext();
  const [addModel, setAddModel] = useState(false);

  const modelCloseHandler = () => setAddModel(!addModel);

  return (
    <>
      <div className="bg-muted p-4 lg:p-6 flex justify-between items-start rounded-[10px] gap-2.5 md:flex-row flex-col">
        <div className="w-full max-w-126">
          <h2 className="text-foreground text-xl lg:text-3xl leading-10 mb-4 lg:mb-6 font-semibold">
            Set Audience
          </h2>
          <SegmentDropdown />

          <p className="text-muted-foreground text-center my-3 relative before:absolute before:content-[''] before:w-[calc(50%-20px)] before:h-px before:bg-input before:left-0 before:top-1/2 after:absolute after:content-[''] after:w-[calc(50%-20px)] after:h-px after:bg-input after:right-0 after:top-1/2">
            OR
          </p>

          <Button
            onClick={modelCloseHandler}
            variant="outline"
            className="w-full h-11 rounded-lg font-semibold hover:bg-background"
          >
            <Plus /> Upload Contact
          </Button>
        </div>

        <div className="w-full max-w-115">
          <h2 className="font-medium text-lg leading-7 mb-6 text-foreground">
            Advanced Settings
          </h2>

          <div className="max-w-90">
            <Controller
              control={control}
              name="openTracking"
              render={({ field }) => (
                <div>
                  <h2 className="text-foreground text-base leading-6 font-medium font-inter">
                    Open tracking
                  </h2>
                  <p className="text-muted-foreground text-xs mt-1 mb-2.5">
                    See exactly who opened your campaign and the moment they
                    opened it.
                  </p>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    {...field}
                    className="h-6 w-10 px-1"
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="clickTracking"
              render={({ field }) => (
                <div className="mt-4">
                  <h2 className="text-foreground text-base leading-6 font-medium font-inter">
                    Click tracking
                  </h2>
                  <p className="text-muted-foreground text-xs mt-1 mb-2.5">
                    Find out who clicked your links, which links they interacted
                    with, and when those clicks happened.
                  </p>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    {...field}
                    className="h-6 w-10 px-1"
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {addModel && (
        <AddSubsciberModel
          segmentId={watch("segmentId")}
          modelCloseHandler={modelCloseHandler}
        />
      )}
    </>
  );
};

export default ChooseAudience;
