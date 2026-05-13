import Stepper from "@/components/ui-custom/step-item-horizontal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ComapingSetup from "./comaping-setup";
import { FiEdit } from "react-icons/fi";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import CampaignDesign from "./design-campaigns";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useAuthentication } from "@/hooks/use-auth";
import { useLocation } from "react-router";
import toast from "react-hot-toast";
import ChooseAudience from "./choose-audience";

interface FormData {
  sender_name: string;
  subject_line: string;
  preheader_text: string;
  sender_email: string;
  segmentId: string;
  openTracking: boolean;
  clickTracking: boolean;
}

const CreateCampaings = ({
  updated,
  data,
}: {
  updated: boolean;
  data: any;
}) => {
  const location = useLocation();
  const typeParam = new URLSearchParams(location.search).get("type");
  const always = new URLSearchParams(location.search).get("always");

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const { CREATE_CAMPAIGN, UPDATE_CAMPAIGN } = useCampaigns();
  const { GET_CAMPAIGN_DATA, SAVE_CAMPAIGN_DATA } = useAuthentication();

  // Campaign Name State
  const [campaignName, setCampaignName] = useState<string>("My Campaign");
  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      sender_name: "",
      subject_line: "",
      preheader_text: "",
      sender_email: "",
      segmentId: "",
      openTracking: false,
      clickTracking: false,
    },
  });

  const steps = [
    { label: "Setup Campaign" },
    { label: "Design" },
    { label: "Choose Audience" },
    { label: "Send" },
  ];

  let stepsData: any = {
    0: <ComapingSetup />,
    1: <CampaignDesign />,
    2: <ChooseAudience />,
    3: <h1>Send</h1>,
  };

  const saveContinue = async () => {
    // If on first step, validate the form
    if (activeStep === 0) {
      const isValid = await methods.trigger([
        "sender_name",
        "subject_line",
        "sender_email",
      ]);

      if (!isValid) {
        return;
      } else {
        if (updated) {
          // toast.success("success");

          const payload = {
            id: data.id,
            name: campaignName,
            senderName: methods.getValues("sender_name"),
            subject: methods.getValues("subject_line"),
            preheaderText: methods.getValues("preheader_text"),
            senderEmailId: methods.getValues("sender_email"),
          };

          UPDATE_CAMPAIGN.mutate(payload, {
            onError(error) {
              console.log("error", error);
            },
            onSuccess(data) {
              const payload = {
                name: data.name,
                senderName: data.sender_name,
                subject: data.sender_name,
                preheaderText: data.preheader_text,
                senderEmailId: data.sender_email_id,
              };
              // navigate(`/email-builder/update-template/${data.id}`);
              toast.success(data.message);

              SAVE_CAMPAIGN_DATA({ ...payload, id: data.id });
              // setActiveStep((prev) => prev + 1);
            },
          });
        } else {
          if (always) {
            const payload = {
              name: campaignName,
              senderName: methods.getValues("sender_name"),
              subject: methods.getValues("subject_line"),
              preheaderText: methods.getValues("preheader_text"),
              senderEmailId: methods.getValues("sender_email"),
            };
            CREATE_CAMPAIGN.mutate(payload, {
              onError(error) {
                console.error("Error creating campaign:", error);
              },
              onSuccess(data) {
                SAVE_CAMPAIGN_DATA({ ...payload, id: data.id });
                setActiveStep((prev) => prev + 1);
              },
            });
          } else {
            if (GET_CAMPAIGN_DATA !== null) {
              const payload = {
                id: GET_CAMPAIGN_DATA.id,
                name: campaignName,
                senderName: methods.getValues("sender_name"),
                subject: methods.getValues("subject_line"),
                preheaderText: methods.getValues("preheader_text"),
                senderEmailId: methods.getValues("sender_email"),
              };

              UPDATE_CAMPAIGN.mutate(payload, {
                onError(error) {
                  console.log("error", error);
                },
                onSuccess(data) {
                  const payload = {
                    name: data.name,
                    senderName: data.sender_name,
                    subject: data.sender_name,
                    preheaderText: data.preheader_text,
                    senderEmailId: data.sender_email_id,
                  };

                  SAVE_CAMPAIGN_DATA({ ...payload, id: data.id });
                  setActiveStep((prev) => prev + 1);
                },
              });
            }
          }
        }
      }
    }

    if (activeStep === 1) {
      console.log("activeStep", activeStep);
    }
    if (activeStep === 2) {
      const isValid = await methods.trigger([
        "segmentId",
        "clickTracking",
        "openTracking",
      ]);
      if (!isValid) {
        return;
      } else {
        const payload = {
          segment_id: methods.getValues("segmentId"),
          open: methods.getValues("openTracking"),
          click: methods.getValues("clickTracking"),
        };
        console.log("payload", payload);
      }
      console.log("[isValid]", isValid);
      console.log("[activeStep]", activeStep);
    }

    return;
    // If last step, submit form
    if (activeStep === steps.length - 1) {
      methods.handleSubmit(onSubmit)();
    } else {
      // Move to next step
      setActiveStep((prev) => prev + 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
    console.log("Campaign Name:", campaignName);
    // Yahan aap API call kar sakte ho
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow going back to previous steps, not forward
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    }
  };

  useEffect(() => {
    if (updated) {
      setCampaignName(data.name);
      methods.setValue("preheader_text", data.preheader_text);
      methods.setValue("sender_name", data.senderName);
      methods.setValue("subject_line", data.subject);
      methods.setValue("sender_email", data.senderEmailId);
    } else {
      if (always) {
        methods.setValue("preheader_text", "");
        methods.setValue("sender_name", "");
        methods.setValue("subject_line", "");
        methods.setValue("sender_email", "");
      } else {
        if (GET_CAMPAIGN_DATA !== null) {
          setCampaignName(GET_CAMPAIGN_DATA.name);
          methods.setValue("preheader_text", GET_CAMPAIGN_DATA.preheaderText);
          methods.setValue("sender_name", GET_CAMPAIGN_DATA.senderName);
          methods.setValue("subject_line", GET_CAMPAIGN_DATA.subject);
          methods.setValue("sender_email", GET_CAMPAIGN_DATA.senderEmailId);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeParam) {
      setActiveStep(parseInt(typeParam, 0));
    }
  }, [typeParam]);

  return (
    <FormProvider {...methods}>
      <p className="text-muted-foreground font-normal font-inter text-base leading-6">
        Campaign Name
      </p>
      <div className="flex items-center gap-4">
        {!isEditingName ? (
          <>
            <h2 className="text-foreground text-xl lg:text-3xl leading-[38px] font-inter font-semibold">
              {campaignName}
            </h2>

            <div
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              <FiEdit className="text-2xl" />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Input
              className="text-3xl font-semibold h-10"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
            <Button onClick={() => setIsEditingName(false)}>Save</Button>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center flex-wrap xl:flex-nowrap my-5 lg:my-9 gap-2.5">
        <div className="overflow-y-hidden">
          <Stepper
            activeStep={activeStep}
            steps={steps}
            onStepClick={handleStepClick}
          />
        </div>
        <div className="">
          <Button
            onClick={saveContinue}
            className="cursor-pointer"
            disabled={methods.formState.isSubmitting}
            type="button"
          >
            {activeStep === steps.length - 1 ? "Submit" : "Save & Continue"}
          </Button>
        </div>
      </div>
      {stepsData[activeStep]}
    </FormProvider>
  );
};

export default CreateCampaings;
