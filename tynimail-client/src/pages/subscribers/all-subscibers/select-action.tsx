import { Button } from "@/components/ui/button";
import { useState } from "react";
import DetailAddSegmentModel from "../single-subscriber-contact/add-segment-model-in-subscriper-detail";
import DeleteModel from "./delete-model";
import { useSubscribers } from "@/hooks/use-subscribers";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";

const SelectSubscriptionAction = ({
  selectedRows,
  single = false,
  csvExporter,
  segmentId = null,
  setSelectedRows,
}: {
  single: boolean;
  selectedRows: Set<any>;
  csvExporter: any;
  segmentId?: any;
  setSelectedRows: any;
}) => {
  const queryClient = useQueryClient();

  const selectedIds = Array.from(selectedRows);
  const selectedCount = selectedIds.length;

  const { SUBSCRIBER_REMOVE_FROMS_SEGMENT, REMOVE_SUBSCRIBER } =
    useSubscribers();

  const [addSegment, setAddSegment] = useState(false);
  const [deleteSegmentModel, setDeleteSegmentModel] = useState(false);
  const [removeFromSegment, setRemoveFromSegment] = useState(false);

  const closeer = () => setAddSegment(!addSegment);
  const segmentModel = () => setDeleteSegmentModel(!deleteSegmentModel);
  const removeSegment = () => setRemoveFromSegment(!removeFromSegment);

  const addSegmentHanlder = () => {
    closeer();
  };
  const deleteSubscriber = () => {
    if (selectedIds.length === 0) {
      toast.success("SegmentId is Required ");
      return;
    }
    REMOVE_SUBSCRIBER.mutate(
      {
        subscriber_ids: selectedIds,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess(data) {
          queryClient.invalidateQueries({
            queryKey: ["GET_ALL_SUBSCRIBERS"],
          });
          toast.success(data.message);
          setSelectedRows(new Set());
        },
      },
    );
  };

  const hanldeConfirmRemoveFromSegment = () => {
    if (!segmentId) {
      toast.success("SegmentId is Required ");
      return;
    }
    SUBSCRIBER_REMOVE_FROMS_SEGMENT.mutate(
      {
        segment_id: segmentId,
        subscriber_ids: selectedIds,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess(data) {
          queryClient.invalidateQueries({
            queryKey: ["SINGLE_ALL_SEGMENTS", segmentId],
          });
          toast.success(data.message);
          setSelectedRows(new Set());
        },
      },
    );
  };
  return (
    <>
      <div className="w-full flex justify-between mb-6 rounded-lg items-center">
        <ul>
          <li>
            <p className="font-medium text-sm leading-5 text-foreground flex justify-center items-center gap-2">
              <div className="border border-border-primary-50 bg-card w-5 h-5 rounded-full text-center flex justify-center items-center font-inter text-xs  text-primary leading-normal">
                {selectedCount}
              </div>
              Selected
            </p>
          </li>
        </ul>
        <ul className="flex justify-center items-center gap-2">
          {single ? (
            <>
              <li>
                <Button
                  variant="outline"
                  className="h-10 "
                  onClick={csvExporter}
                >
                  Export CSV
                </Button>
              </li>
              <li>
                <Button
                  variant="destructive"
                  className="h-10  dark:bg-red-500 dark:border-border"
                  disabled={
                    SUBSCRIBER_REMOVE_FROMS_SEGMENT.status === "pending"
                  }
                  onClick={removeSegment}
                >
                  Remove from Segment
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Button
                  variant="outline"
                  className="h-10"
                  // className="h-10 dark:border-background dark:bg-background dark:hover:bg-background"
                  // className="h-10 dark:border-background dark:bg-background dark:hover:bg-background"
                  onClick={addSegmentHanlder}
                >
                  <Plus size={15} />
                  Add to Segment
                </Button>
              </li>

              <li>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={csvExporter}
                >
                  Export CSV
                </Button>
              </li>
              <li>
                <Button
                  variant="destructive"
                  className="h-10  dark:bg-red-500 dark:border-border"
                  onClick={segmentModel}
                >
                  Delete Subscriber
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
      {addSegment && (
        <DetailAddSegmentModel
          modelCloseHandler={() => closeer()}
          subscriberId={selectedIds}
          allSegmentApi={true}
        />
      )}
      {deleteSegmentModel && (
        <DeleteModel
          title="Permanently delete subscriber?"
          description=" You’re about to permanently delete this subscriber from the
                system. All associated data will be erased."
          buttonTitle="Delete Subscriber"
          conform={deleteSubscriber}
          modelCloseHandler={() => segmentModel()}
        />
      )}
      {removeFromSegment && (
        <DeleteModel
          title="Permanently delete segment?"
          description="You’re about to permanently delete this segment. 
                This action cannot be undone and the segment will be removed
                from all associated campaigns and workflows."
          conform={hanldeConfirmRemoveFromSegment}
          modelCloseHandler={() => removeSegment()}
          buttonTitle="Confirm Segment"
        />
      )}
    </>
  );
};

export default SelectSubscriptionAction;
