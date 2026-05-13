import { Label } from "@/components/ui/label";
import ModelLayout from "../model/model-layout";
import { Controller, useForm } from "react-hook-form";
import { RefreshCcw } from "lucide-react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FiX } from "react-icons/fi";
import { useEffect } from "react";

import OnlySegment from "./only-segment";
import CustomOption from "./custom-component";
type FilterFormValues = {
  status: number | null;
  missingFields: string[];
  segmentCondition: string;
  segment: any[];
};

type FilterName = "subscriber" | "single-segment";

const FilterModel = ({
  modelCloseHandler,
  onSubmitFilter,
  name,
  initialValues,
  resetFilter,
}: {
  modelCloseHandler: () => void;
  onSubmitFilter: (any: any) => void;
  name: FilterName;
  initialValues?: FilterFormValues | null;
  resetFilter: () => void;
}) => {
  const { handleSubmit, control, setValue, reset } = useForm<FilterFormValues>({
    defaultValues: {
      status: initialValues?.status ?? null,
      missingFields: initialValues?.missingFields ?? [],
      segmentCondition: "",
      segment: [],
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue("status", initialValues.status);
      setValue("missingFields", initialValues.missingFields);
      setValue("segmentCondition", initialValues.segmentCondition);
      setValue("segment", initialValues.segment);
    } else {
      setValue("status", null);
      setValue("missingFields", []);
      setValue("segmentCondition", "");
      setValue("segment", []);
    }
  }, [initialValues, setValue]);

  const onSubmit = (data: any) => {
    onSubmitFilter(data);
  };

  const statusOptions = [
    { label: "Verified", value: 1 },
    { label: "Not Verified", value: 0 },
  ];

  const missingFieldOptions = [
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "email", label: "Email" },
  ];

  const segmentsConditions = [
    { value: "is_in_any", label: "Is in any of these" },
    { value: "is_in_all", label: "Is in all of these" },
    { value: "is_not_in_any", label: "Is not in any of these" },
    { value: "is_not_in_all", label: "Is not in all of these" },
    { value: "is_only_in", label: "Is only in these" },
    { value: "is_not_in_any_segment", label: "Is not in any segment" },
  ];

  return (
    <ModelLayout>
      <div className="p-4 w-full mx-auto max-w-113">
        <div className="w-full bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <div className="flex justify-between items-center ">
            <h2 className="text-2xl font-semibold font-inter leading-8 text-foreground">
              Filter Subscribers
            </h2>
            <p
              onClick={() => {
                resetFilter();
                reset();
                onSubmitFilter(null);
                modelCloseHandler();
              }}
              className="text-red-500  font-medium text-sm leading-5 gap-1 cursor-pointer flex justify-end items-center"
            >
              <RefreshCcw size={15} />
              Reset
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 mt-4">
            <div className="flex flex-col gap-2">
              {statusOptions.map((item) => (
                <Controller
                  key={item.value}
                  name="status"
                  control={control}
                  render={({ field }) => {
                    const isChecked = field.value === item.value;
                    const checkboxId = `status-${item.value}`; // unique id per option

                    return (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={checkboxId}
                          checked={isChecked}
                          className="!rounded-full"
                          onCheckedChange={() => field.onChange(item.value)}
                        />

                        <Label htmlFor={checkboxId}>{item.label}</Label>
                      </div>
                    );
                  }}
                />
              ))}
            </div>

            {/* <div>
                <hr className="bg-border " />
              </div> */}
            {/* Missing Fields Select */}
            <div className="">
              <Label className="mb-2 block">
                Subscriber doesn’t have any of the following fields
              </Label>

              <Controller
                name="missingFields"
                control={control}
                render={({ field }) => (
                  <>
                    {/* badges below */}

                    <Select
                      isMulti
                      hideSelectedOptions
                      closeMenuOnSelect={true}
                      options={missingFieldOptions}
                      placeholder="Choose Data Field"
                      value={missingFieldOptions.filter((opt) =>
                        field.value.includes(opt.value),
                      )}
                      onChange={(selected) => {
                        const values = selected.map((item) => item.value);
                        field.onChange(values);
                      }}
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
                      classNamePrefix="react-select input-custom"
                    />
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {field.value.map((id: string) => {
                          const seg = missingFieldOptions.find(
                            (o: any) => o.value === id,
                          );
                          return (
                            <span
                              key={id}
                              className="px-2 py-1 rounded text-sm font-medium text-background flex items-center gap-1 bg-foreground"
                            >
                              {seg?.label}
                              <button
                                type="button"
                                onClick={() =>
                                  field.onChange(
                                    field.value.filter((v: string) => v !== id),
                                  )
                                }
                                className="ml-1"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              />
            </div>

            {name === "subscriber" && (
              <div className="mb-6  bg-muted p-2.5 rounded-lg">
                <Label className="mb-2 block">Segments</Label>
                <div className="relative grid gap-4">
                  <Controller
                    name="segmentCondition"
                    control={control}
                    render={({ field }) => {
                      const selectedOption = segmentsConditions.find(
                        (opt) => opt.value === field.value,
                      );

                      return (
                        <>
                          <Select
                            options={segmentsConditions}
                            placeholder="Is in any of these"
                            value={selectedOption ?? null}
                            onChange={(selected) =>
                              field.onChange(selected ? selected.value : null)
                            }
                            components={{
                              Option: CustomOption,
                            }}
                            isMulti={false} // 🔒 explicitly single
                            styles={{
                              indicatorSeparator: () => ({ display: "none" }),
                              clearIndicator: () => ({ display: "none" }),
                            }}
                            classNamePrefix="react-select input-custom"
                          />
                        </>
                      );
                    }}
                  />

                  <OnlySegment
                    control={control}
                    modelCloseHandler={modelCloseHandler}
                  />
                </div>
              </div>
            )}
            {/* Buttons */}
            <div className="grid gap-5 grid-cols-2">
              <Button
                variant="outline"
                type="reset"
                onClick={() => {
                  return modelCloseHandler();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </div>
      </div>
    </ModelLayout>
  );
};

export default FilterModel;
