import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCampaigns } from "@/hooks/use-campaigns";
import toast from "react-hot-toast";

interface DeleteCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName?: string;
  data: any;
}

const DeleteCampaignModal = ({
  open,
  onOpenChange,
  campaignName = "this campaign",
  data,
}: DeleteCampaignModalProps) => {
  const { DELETE_CAMPAIGN } = useCampaigns();

  const handleDelete = () => {
    console.log("data", data.id);
    DELETE_CAMPAIGN.mutate(
      { id: data.id },
      {
        onSuccess(data) {
          toast.success(data.message);
          onOpenChange(false);
        },
        onError(error) {
          toast.success(error.message);
          onOpenChange(false);
        },
      }
    );

    // setTimeout(() => {
    //   onOpenChange(false);
    // }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 m-auto h-max">
        <DialogHeader>
          <DialogTitle>Delete {campaignName}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {campaignName}? This action cannot
            be undone and will permanently remove all campaign data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCampaignModal;
