import { useCampaigns } from "@/hooks/use-campaigns";
import { useParams } from "react-router";
import CreateCampaings from "./create-campaings";
import CampaignsPageSkeleton from "@/components/skeleton/compagin-seleton";

const CampaignsPageUpdate = () => {
  const params = useParams();
  const { id: compaignId } = params;
  const { GET_COMPAIGN } = useCampaigns();

  const { data, isLoading, isError, error } = GET_COMPAIGN(compaignId ?? "");

  if (isLoading) {
    return <CampaignsPageSkeleton />;
  }
  if (isError) {
    return <p className="text-red-500"> {error.message} </p>;
  }
  return (
    <CreateCampaings
      updated={true}
      data={{
        preheader_text: data.preheader_text,
        senderName: data.sender_name,
        subject: data.subject,
        senderEmailId: data.sender_email_id,
        name: data.name,
        id: data.id,
        templateId: data.template_id,
      }}
    />
  );
};

export default CampaignsPageUpdate;
