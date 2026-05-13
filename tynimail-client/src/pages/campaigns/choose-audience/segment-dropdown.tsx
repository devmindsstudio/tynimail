import { useSegments } from "@/hooks/use-segments";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFormContext, Controller } from "react-hook-form";

const SegmentDropdown = () => {
  const { GET_ALL_SEGMENTS } = useSegments();
  const { data, isLoading, isError, error } = GET_ALL_SEGMENTS();
  const SegmentData = data?.segments ?? [];

  const { control } = useFormContext();

  if (isLoading) {
    return (
      <div className="">
        <div className="h-4 w-32 mb-2 bg-border rounded animate-pulse" />
        <div className="h-10 w-full bg-border rounded animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500">{error.message}</p>;
  }

  if (SegmentData.length === 0) {
    return (
      <div>
        <Label className="mb-1.5">Subscribers in</Label>
        <p className="text-muted-foreground text-sm">No segments found</p>
      </div>
    );
  }

  return (
    <Controller
      name="segmentId"
      control={control}
      rules={{ required: "Segment is required" }}
      render={({ field, fieldState }) => (
        <>
          <Label htmlFor="segment" className="mb-1.5">
            Subscribers in
          </Label>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select a segment" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {SegmentData.map((seg: any) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    {seg.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {fieldState.error && (
            <p className="text-red-500 text-sm mt-1">
              {fieldState.error.message}
            </p>
          )}
        </>
      )}
    />
  );
};

export default SegmentDropdown;
