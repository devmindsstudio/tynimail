import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { BsFilter } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router";

const TempalateWrapper = ({
  children,
  setSearch,
  search,
}: {
  children: React.ReactNode;
  setSearch: (search: string) => void;
  search: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { label: "Browse", value: "all", link: "/pages/templates" },
    { label: "My Pages", value: "pages", link: "/pages/templates/my" },
  ];

  useEffect(() => {
    if (location.pathname === "/pages/templates") {
      setActiveTab("all");
    } else if (location.pathname === "/pages/templates/my") {
      setActiveTab("pages");
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    const url = value === "all" ? "/pages/templates" : "/pages/templates/my";
    navigate(url);
    setActiveTab(value);
  };

  return (
    <div className="bg-muted p-6 h-full rounded-xl flex flex-col">
      <div className="header-content">
        <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
          <div className="flex items-center bg-muted rounded-lg">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full p-0 bg-muted rounded-lg "
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
        </div>
        <div className="flex items-center w-full justify-between gap-4">
          <div className="max-w-full w-full relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
              placeholder={
                activeTab == "all"
                  ? "Browse pages templates"
                  : "My pages templates"
              }
            />
          </div>
          <Button
            variant="outline"
            className="h-11 !px-4 cursor-pointer dark:bg-background"
          >
            <BsFilter size={20} />
            <span className="text-sm font-semibold font-inter">Filters</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-x-hidden mt-6 remove-side-barscrollbar">{children}</div>
    </div>
  );
};

export default TempalateWrapper;
