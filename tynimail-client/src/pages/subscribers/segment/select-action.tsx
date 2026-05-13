import { Button } from "@/components/ui/button";
import { useState } from "react";

import { Pen } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import DeleteModel from "../all-subscibers/delete-model";
import AddSegmentModel from "../add-segment-model";
import { useSegments } from "@/hooks/use-segments";
import toast from "react-hot-toast";

const SelectSegmentAction = ({
  selectedRows,
  csvExporter,
  setSelectedRows,
}: {
  selectedRows: Set<any>;
  csvExporter: any;
  setSelectedRows: any;
}) => {
  const queryClient = useQueryClient();

  const { REMOVE_SEGMENT } = useSegments();
  const selectedIds = Array.from(selectedRows);
  const selectedCount = selectedIds.length;

  const [deleteSegmentModel, setDeleteSegmentModel] = useState(false);
  const [editSegmentModel, setEditSegmentModel] = useState(false);

  const segmentModel = () => setDeleteSegmentModel(!deleteSegmentModel);
  const editSegmentHanlder = () => setEditSegmentModel(!editSegmentModel);

  const renamHanlder = () => {
    editSegmentHanlder();
  };
  const deleteSegmentModelHanlder = () => {
    if (selectedIds.length === 0) {
      return;
    }
    segmentModel();
  };

  const hanldeConfirmDeleteSegment = () => {
    if (selectedIds.length === 0) {
      toast.success("SegmentId is Required ");
      return;
    }
    REMOVE_SEGMENT.mutate(
      {
        subscriber_ids: selectedIds,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess(data) {
          queryClient.invalidateQueries({
            queryKey: ["GET_ALL_SEGMENTS"],
          });
          toast.success(data.message);
          setSelectedRows(new Set());
        },
      },
    );
    // setSelectedRows(new Set());
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
          <>
            {selectedCount === 1 && (
              <li>
                <Button
                  variant="outline"
                  className="h-10"
                  // className="h-10 dark:border-background dark:bg-background dark:hover:bg-background"
                  // className="h-10 dark:border-background dark:bg-background dark:hover:bg-background"
                  onClick={renamHanlder}
                >
                  <Pen size={15} />
                  Edit
                </Button>
              </li>
            )}
            <li>
              <Button variant="outline" className="h-10" onClick={csvExporter}>
                Export CSV
              </Button>
            </li>
            <li>
              <Button
                variant="destructive"
                className="h-10  dark:bg-red-500 dark:border-border"
                onClick={deleteSegmentModelHanlder}
              >
                Delete Segment
              </Button>
            </li>
          </>
        </ul>
      </div>

      {deleteSegmentModel && (
        <DeleteModel
          title="Permanently delete segment?"
          description="You’re about to permanently delete this segment from the system. All associated data and rules will be erased."
          buttonTitle="Delete Segment"
          conform={hanldeConfirmDeleteSegment}
          modelCloseHandler={() => segmentModel()}
        />
      )}
      {editSegmentModel && (
        <AddSegmentModel
          segmentId={selectedIds.length > 0 && selectedIds[0]}
          update={true}
          modelCloseHandler={renamHanlder}
        />
      )}
    </>
  );
};

export default SelectSegmentAction;
