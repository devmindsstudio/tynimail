import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Domain from "./verifications/domain";
import Email from "./verifications/email";
import VerifyNotification from "./verifications/verify-notification";
import { useEmails } from "@/hooks/use-emails";
import toast from "react-hot-toast";
import { useDomains } from "@/hooks/use-domain";
import DomainDetail from "./verifications/domain-detail";
const SettingsWrapper = ({ children }: { children: React.ReactNode }) => {
  const { SENDER_EMAIL_VERIFY } = useEmails();
  const { DOMAIN_VERIFICATION } = useDomains();
  const navigate = useNavigate();
  const location = useLocation();
  const [model, setModel] = useState<"domain" | "email" | null>(null);
  const [openVerifyModel, setPpenVerifyModel] = useState<string | null>(null);
  const [dominModel, setModelDomain] = useState<any>("");

  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { label: "Your Profile", value: "all", link: "/settings" },
    { label: "Account Settings", value: "account", link: "/settings/account" },
    { label: "Billings", value: "billings", link: "/settings/billings" },
    { label: "Integrations", value: "integrations", link: "/settings/integrations" },
  ];

  useEffect(() => {
    if (location.pathname === "/settings") {
      setActiveTab("all");
    } else if (location.pathname === "/settings/account") {
      setActiveTab("account");
    } else if (location.pathname === "/settings/billings") {
      setActiveTab("billings");
    } else if (location.pathname === "/settings/integrations") {
      setActiveTab("integrations");
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    const urlMap: Record<string, string> = {
      account: "/settings/account",
      billings: "/settings/billings",
      integrations: "/settings/integrations",
    };
    navigate(urlMap[value] ?? "/settings");
    setActiveTab(value);
  };

  const onClosedModel = () => {
    setModel(null);
  };

  const onVerificationModal = (type: "email" | "domain", value: string) => {
    if (type === "email") {
      SENDER_EMAIL_VERIFY.mutate(
        {
          email: value,
          name: value,
        },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess(data) {
            setModel(null);
            setPpenVerifyModel(value);
            toast.success(data.message);
          },
        },
      );
    }
    if (type === "domain") {
      DOMAIN_VERIFICATION.mutate(
        { domain: value },
        {
          onError(error) {
            toast.error(error.message);
          },
          onSuccess(data) {
            // console.log("data", data.domain);
            // setModelDomain({ domain: domain });

            setModel(null);
            // setPpenVerifyModel(value);
            toast.success(data.message);
          },
        },
      );
    }
  };
  return (
    <>
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
        <div className="flex items-center bg-muted rounded-lg">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full p-1 bg-muted rounded-lg "
          >
            <TabsList className="bg-muted p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="py-1.5 px-3 cursor-pointer leading-5"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="cursor-pointer">
              Verify New Sender
              <ChevronDown size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem
              onClick={() => setModel("domain")}
              className="font-medium text-xs leading-4  p-2 text-accent-foreground cursor-pointer"
            >
              Verify Domain
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setModel("email")}
              className="font-medium text-xs leading-4  p-2 text-accent-foreground cursor-pointer"
            >
              Verify Email Address
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}

      {model === "domain" && (
        <Domain
          onClose={onClosedModel}
          disabled={DOMAIN_VERIFICATION.status === "pending"}
          onVerify={onVerificationModal}
        />
      )}
      {model === "email" && (
        <Email
          onClose={onClosedModel}
          disabled={SENDER_EMAIL_VERIFY.status === "pending"}
          onVerify={onVerificationModal}
        />
      )}
      {openVerifyModel && (
        <VerifyNotification
          type={"email"}
          value={openVerifyModel}
          onClose={() => setPpenVerifyModel(null)}
        />
      )}
      {dominModel && (
        <DomainDetail
          domain={dominModel}
          onClose={() => {
            setModelDomain(null);
            setModel(null);
          }}
        />
      )}
    </>
  );
};

export default SettingsWrapper;
