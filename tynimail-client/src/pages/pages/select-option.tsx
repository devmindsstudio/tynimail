import { Button } from "@/components/ui/button";
import { useState } from "react";
import DeleteModel from "../subscribers/all-subscibers/delete-model";
import toast from "react-hot-toast";
import { usePages } from "@/hooks/use-pages";

const SelectOption = ({
  selectedRows,
  makeCopyHanlder,
  setSelectedRows,
  shareHanlder,
}: {
  selectedRows: Set<any>;
  makeCopyHanlder: any;
  setSelectedRows: any;
  shareHanlder: any;
}) => {
  const selectedIds = Array.from(selectedRows);
  const selectedCount = selectedIds.length;
  const { DELELTE_MULTIPALE_PAGES } = usePages();
  const [deletePageModel, setPageModel] = useState(false);
  const pageModel = () => setPageModel(!deletePageModel);

  const handleConfirmDeletePage = () => {
    if (selectedIds.length === 0) {
      toast.success("Page Id is Required ");
      return;
    }
    DELELTE_MULTIPALE_PAGES.mutate(
      {
        pageIds: selectedIds,
      },
      {
        onError(error) {
          toast.error(error.message);
        },
        onSuccess(data) {
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
          <li>
            <Button
              variant="outline"
              className="h-10"
              onClick={makeCopyHanlder}
            >
              Make a Copy
            </Button>
          </li>
          {selectedCount === 1 && (
            <li>
              <Button variant="outline" onClick={shareHanlder} className="h-10">
                Share
              </Button>
            </li>
          )}
          <li>
            <Button
              variant="destructive"
              onClick={pageModel}
              className="h-10  dark:bg-red-500 dark:border-border"
            >
              Delete Page
            </Button>
          </li>
        </ul>
      </div>
      {deletePageModel && (
        <DeleteModel
          title="Permanently delete page?"
          description="You’re about to permanently delete this page from the system. All associated data and content will be erased."
          buttonTitle="Delete Page"
          conform={handleConfirmDeletePage}
          modelCloseHandler={() => pageModel()}
        />
      )}
    </>
  );
};

export default SelectOption;
