import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AddSegmentModel from "./add-segment-model";
import AddSubsciberModel from "./add-subsciber-model";

const SubWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [model, setModel] = useState<"segment" | "subscriber" | null>(null);

  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { label: "All Subscribers", value: "all" },
    { label: "Segments", value: "segments" },
  ];

  useEffect(() => {
    if (location.pathname.endsWith("/segments")) {
      setActiveTab("segments");
    } else {
      setActiveTab("all");
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    navigate(value === "segments" ? "/subscribers/segments" : "/subscribers");
  };

  const modelCloseHandler = () => {
    setModel(null);
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
        {activeTab === "all" ? (
          <Button
            className="cursor-pointer"
            onClick={() => setModel("subscriber")}
            //   onClick={() => navigate("/campaigns/create-campaign?always=true")}
          >
            <Plus size={18} />
            Add Subscriber
          </Button>
        ) : (
          <Button
            className="cursor-pointer"
            onClick={() => setModel("segment")}
            //   onClick={() => navigate("/campaigns/create-campaign?always=true")}
          >
            <Plus size={18} />
            Create Segment
          </Button>
        )}
      </div>
      {children}

      {/* {activeTab === "all" ? <AllSubscribers /> : <Segments />} */}
      {model === "subscriber" && (
        <AddSubsciberModel
          segmentId={null}
          modelCloseHandler={modelCloseHandler}
        />
      )}
      {model === "segment" && (
        <AddSegmentModel
          update={false}
          segmentId={null}
          modelCloseHandler={modelCloseHandler}
        />
      )}
    </>
  );
};

export default SubWrapper;
