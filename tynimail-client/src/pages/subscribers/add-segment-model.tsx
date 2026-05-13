import { useState, useRef, useCallback, useEffect } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import ModelLayout from "../model/model-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import ColorPalette from "@/components/color-palette";
import Color from "color";
import { useSegments } from "@/hooks/use-segments";
import toast from "react-hot-toast";

interface FormValues {
  name: string;
  color: string;
}
const Skeleton = ({ className }: { className: any }) => (
  <div className={`animate-pulse bg-muted/60 rounded-md ${className}`} />
);
const AddSegmentModel = ({
  modelCloseHandler,
  segmentId = null,
  update,
}: {
  update: boolean;
  modelCloseHandler: () => void;
  segmentId: any;
}) => {
  const { CREATE_SEGMENT, GET_SEGMENT_BY_ID, UPDATE_SEGMENT } = useSegments();

  const { data, isLoading } = GET_SEGMENT_BY_ID(update ? segmentId : null);

  const [openPalette, setOpenPalette] = useState(false);
  const colorTriggerRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      color: "#000000",
    },
  });

  const color = watch("color");

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (update) {
      UPDATE_SEGMENT.mutate(
        {
          id: segmentId,
          color: data.color,
          name: data.name,
        },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess(data) {
            toast.success(data.message);
            modelCloseHandler();
          },
        },
      );
    } else {
      CREATE_SEGMENT.mutate(
        {
          color: data.color,
          name: data.name,
        },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess(data) {
            toast.success(data.message);
            modelCloseHandler();
          },
        },
      );
    }
  };

  const onCoselPalette = () => {
    setOpenPalette(!openPalette);
  };

  const handleColorChange = useCallback(
    (rgba: Parameters<typeof Color.rgb>[0]) => {
      const rgbaArray = rgba as number[];
      const alphaValue =
        isNaN(rgbaArray[3]) || rgbaArray[3] === undefined ? 1 : rgbaArray[3];

      // Round RGB values to integers to prevent floating point issues
      const r = Math.round(rgbaArray[0]);
      const g = Math.round(rgbaArray[1]);
      const b = Math.round(rgbaArray[2]);

      const colorObj = Color.rgb(r, g, b).alpha(alphaValue);

      // Get hex color (normalize to uppercase for consistent comparison)
      const hexColor = colorObj.hex().toUpperCase();

      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce the update to prevent too many rapid updates
      updateTimeoutRef.current = setTimeout(() => {
        const currentColor = getValues("color");
        const normalizedCurrent = currentColor?.toUpperCase() || "";

        // Only update if the color actually changed
        if (hexColor !== normalizedCurrent) {
          setValue("color", hexColor, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
        updateTimeoutRef.current = null;
      }, 50); // Small debounce for smooth updates
    },
    [setValue, getValues],
  );

  useEffect(() => {
    if (data && !isLoading) {
      setValue("color", data.segment.color);
      setValue("name", data.segment.name);
    }
  }, [update, segmentId, data, setValue]);

  if (isLoading) {
    return (
      <ModelLayout>
        <div className="relative p-4">
          <div className="w-full max-w-106.25 bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative space-y-6">
            <Skeleton className="w-8 h-8 absolute top-4 right-4 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-4 mt-8">
              <div className="grid grid-cols-2 items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <div className="relative">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="absolute right-4 top-2 h-6 w-6 rounded-md" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-36 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </ModelLayout>
    );
  }
  return (
    <ModelLayout>
      <div className="relative p-4">
        <div className="w-full max-w-106.25 bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <button className="w-8 h-8 absolute top-4 right-4 flex justify-center items-center">
            <X className="size-6" onClick={modelCloseHandler} />
          </button>
          {update ? (
            <>
              <h2 className="text-2xl font-semibold font-inter leading-8">
                Edit Segment
              </h2>
              <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
                Update the rules for this user segment.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold font-inter leading-8">
                New Segment
              </h2>
              <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
                Create a group of users based on rules you choose.
              </p>
            </>
          )}

          <form
            className="form mt-8 space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Name */}
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="name" className="capitalize">
                name
              </Label>
              <div className="flex flex-col w-full">
                <Input
                  type="text"
                  id="name"
                  placeholder="Tyni Mail"
                  {...register("name", {
                    required: "Name is required",
                    pattern: {
                      value: /^[A-Za-z]+( [A-Za-z]+)*$/,
                      message:
                        "Only letters allowed, single space between words (no start/end space)",
                    },
                    minLength: { value: 2, message: "Minimum 2 characters" },
                    maxLength: { value: 50, message: "Maximum 50 characters" },
                  })}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>

            {/* Color */}
            <div className="grid grid-cols-2 items-center">
              <Label htmlFor="color" className="capitalize">
                Color
              </Label>
              <div className="flex flex-col w-full">
                <div className="relative">
                  <Controller
                    name="color"
                    control={control}
                    rules={{
                      required: "Color is required",
                      pattern: {
                        value: /^#[0-9A-Fa-f]{6}$/,
                        message: "Enter a valid 6-character hex color",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        type="text"
                        placeholder="#000000"
                        id="color"
                        maxLength={7}
                        // readOnly={true}
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value;
                          let hex = value
                            .replace(/^#/, "")
                            .replace(/[^0-9A-Fa-f]/g, "")
                            .slice(0, 6);
                          hex = "#" + hex;
                          field.onChange(hex);
                        }}
                      />
                    )}
                  />
                  <div
                    ref={colorTriggerRef}
                    onClick={onCoselPalette}
                    className="absolute w-6 h-6 rounded-md top-0 bottom-0 right-4 my-auto shadow-md cursor-pointer"
                    style={{
                      backgroundColor: color || "#000000",
                    }}
                  ></div>
                </div>
                {errors.color && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.color.message}
                  </span>
                )}
              </div>
            </div>

            {update ? (
              <div className="flex justify-end items-center">
                <Button
                  type="submit"
                  disabled={UPDATE_SEGMENT.status === "pending"}
                >
                  Update Segment
                </Button>
              </div>
            ) : (
              <div className="flex justify-end items-center">
                <Button type="submit">Create Segment</Button>
              </div>
            )}
          </form>
        </div>

        {openPalette && (
          <ColorPalette
            triggerRef={colorTriggerRef}
            onClose={() => {
              // Clear any pending updates when closing
              if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = null;
              }
              setOpenPalette(false);
            }}
            color={color}
            handleColorChange={handleColorChange}
          />
        )}
      </div>
    </ModelLayout>
  );
};export default AddSegmentModel;