import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { useSegments } from "@/hooks/use-segments";
import CustomOption from "./custom-component";

export const SegMentAndButton = ({
  control,
  errors,
  modelCloseHandler,
  disabled,
  segmentId,
}: any) => {
  const { GET_ALL_SEGMENTS } = useSegments();
  const { data, isLoading, isError, error } = GET_ALL_SEGMENTS();
  const SegmentData = data?.segments ?? [];

  const options = SegmentData.map((seg: any) => ({
    value: seg.id,
    label: seg.name,
    color: seg.color || "#60A5FA",
  }));

  if (isLoading) return <p>Loading segments...</p>;

  if (isError)
    return (
      <>
        <p className="text-red-500 text-sm">{error.message}</p>
        <div className="grid gap-5 grid-cols-2 mt-2">
          <Button variant="outline" type="reset" onClick={modelCloseHandler}>
            Cancel
          </Button>
          <Button type="submit" disabled={true}>
            Add Subscriber
          </Button>
        </div>
      </>
    );

  return (
    <>
      {!segmentId && (
        <div className="mb-6">
          <Label className="mb-1.5">Choose Segment(s)</Label>

          <Controller
            name="segment"
            control={control}
            // rules={{ required: "At least one segment is required" }}
            render={({ field }) => {
              // map field.value (array of ids) to react-select options
              const selectedOptions = options.filter((o: any) =>
                field.value?.includes(o.value),
              );

              return (
                <>
                  <Select
                    isMulti
                    options={options}
                    value={selectedOptions} // keep all selected options
                    onChange={(selected) =>
                      field.onChange(selected.map((s: any) => s.value))
                    }
                    classNamePrefix="react-select input-custom"
                    placeholder="Select segment(s)"
                    closeMenuOnSelect={true}
                    hideSelectedOptions
                    components={{
                      Option: CustomOption,
                    }}
                    menuPlacement="auto"
                    styles={{
                      multiValue: (base) => ({ ...base, display: "none" }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: "none",
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        display: "none",
                      }),
                    }}
                  />

                  {/* badges below */}
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {field.value.map((id: string) => {
                        const seg = options.find((o: any) => o.value === id);
                        return (
                          <span
                            key={id}
                            className="px-3 py-1 rounded text-sm font-medium text-white flex items-center gap-1"
                            style={{
                              backgroundColor: seg?.color || "#60A5FA",
                            }}
                          >
                            {seg?.label}
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  field.value.filter((v: string) => v !== id),
                                )
                              }
                              className="ml-1 text-white hover:text-gray-200"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            }}
          />

          {errors.segment && (
            <p className="text-red-500 text-sm mt-1">
              {errors.segment.message}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-5 grid-cols-2">
        <Button variant="outline" type="reset" onClick={modelCloseHandler}>
          Cancel
        </Button>
        <Button type="submit" disabled={disabled}>
          Add Subscriber
        </Button>
      </div>
    </>
  );
};
