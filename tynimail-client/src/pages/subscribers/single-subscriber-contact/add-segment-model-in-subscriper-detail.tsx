import { useState } from "react";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import toast from "react-hot-toast";
import ModelLayout from "@/pages/model/model-layout";
import SubscriberDetailSegmentDropdown from "./segment-dropdown";
import { useSubscribers } from "@/hooks/use-subscribers";

const DetailAddSegmentModel = ({
  modelCloseHandler,
  subscriberId,
  allSegmentApi = false,
}: {
  modelCloseHandler: () => void;
  subscriberId: any;
  allSegmentApi: boolean;
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<any>(null);

  const { ADD_SUBSCRIBER_TO_SEGMENT } = useSubscribers();

  const addToSubsciberInSegment = () => {
    if (!selectedSegmentId || !subscriberId) {
      toast.error("Required Segment ID and Subscriber ID");
    } else {
      ADD_SUBSCRIBER_TO_SEGMENT.mutate(
        {
          subscriber_ids: subscriberId,
          segment_id: selectedSegmentId,
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
  return (
    <ModelLayout>
      <div className="relative p-4 w-full max-w-113">
        <div className="w-full bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <button className="w-8 h-8 absolute top-4 right-4 flex justify-center items-center">
            <X className="size-6" onClick={modelCloseHandler} />
          </button>
          <h2 className="text-2xl font-semibold font-inter leading-8">
            Add Subscribers to Segment
          </h2>
          <p className="text-sm font-normal text-muted-foreground font-sans mt-2">
            Choose a segment to assign this email.
          </p>

          <div className="my-4">
            <SubscriberDetailSegmentDropdown
              allSegmentApi={allSegmentApi}
              value={selectedSegmentId}
              subscriberId={subscriberId}
              onChange={setSelectedSegmentId}
            />
          </div>
          <Button
            disabled={ADD_SUBSCRIBER_TO_SEGMENT.status === "pending"}
            onClick={addToSubsciberInSegment}
          >
            Add Segment
          </Button>
        </div>
      </div>
    </ModelLayout>
  );
};

export default DetailAddSegmentModel;
