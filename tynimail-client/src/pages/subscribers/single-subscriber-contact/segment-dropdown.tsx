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
import { useSubscribers } from "@/hooks/use-subscribers";
const SubscriberDetailSegmentDropdown = ({
  value,
  onChange,
  subscriberId,
  allSegmentApi,
}: {
  value?: string;
  onChange: (val: string) => void;
  subscriberId: any;
  allSegmentApi: boolean;
}) => {
  const { AVAILABLE_SEGMENTS } = useSubscribers();

  //// if allSegmentApi aghe yeh true hai to pheyh api caly wrna available wli
  const { GET_ALL_SEGMENTS } = useSegments();
  const apiResult = allSegmentApi
    ? GET_ALL_SEGMENTS()
    : AVAILABLE_SEGMENTS(subscriberId);

  const { data, isLoading, isError, error } = apiResult;

  const SegmentData = data?.segments ?? [];
  if (isLoading) {
    return (
      <>
        <div className="">
          <div className="h-4 w-32 mb-2 bg-border rounded animate-pulse" />
          <div className="h-10 w-full  bg-border rounded animate-pulse" />
        </div>
      </>
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
    <>
      {/* <Select onValueChange={field.onChange} value={field.value}> */}
      <Label htmlFor="email" className="mb-1.5">
        Choose segments
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Choose segments" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {SegmentData.map((seg: any) => (
              <SelectItem key={seg.id} value={seg.id}>
                <div className="flex items-center gap-3 py-1">
                  <span
                    className="w-3 h-3 block rounded-full"
                    style={{
                      backgroundColor: seg.color,
                    }}
                  />

                  <span className="flex-1">{seg.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default SubscriberDetailSegmentDropdown;
