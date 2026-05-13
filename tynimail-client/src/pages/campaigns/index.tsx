import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import CampaignsTable from "./campaign-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router";

const CampaignsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(
    searchParams.get("status") || "all"
  );

  const tabs = [
    { label: "All", value: "all" },
    { label: "Live", value: "live" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Drafts", value: "draft" },
  ];

  // Update URL params when tab changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (activeTab !== "all") {
      params.set("status", activeTab);
    }

    setSearchParams(params, { replace: true });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
        <div className="flex items-center bg-muted rounded-lg">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full p-1 bg-muted rounded-lg"
          >
            <TabsList className="bg-muted p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="py-1.5 px-3 cursor-pointer"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => navigate("/campaigns/create-campaign?always=true")}
        >
          <Plus size={18} />
          Create Campaign
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="max-w-81 w-full relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search Campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* <Button variant="outline">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter</span>
        </Button> */}
      </div>
      <CampaignsTable searchQuery={searchQuery} statusFilter={activeTab} />
    </div>
  );
};

export default CampaignsPage;
