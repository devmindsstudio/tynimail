import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Target, Clock } from "lucide-react";
import { Link, useParams } from "react-router";
import ViewsByDevices from "./views-devices";
import VistorsTrends from "./vistors-trends";
import { usePages } from "@/hooks/use-pages";
import { AnalyticsSkeletonPage } from "./skeleton";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/utils/convert-minute";

const AnalyticsPage = () => {
  const { id } = useParams();

  const breadcrumbs = [
    { name: "Pages", link: "/pages" },
    { name: "My Templates", link: "/pages/templates" },
  ];

  const { GET_ANAYLATIC_PAGE_BY_ID } = usePages();

  const anaylaticsData = GET_ANAYLATIC_PAGE_BY_ID(id ?? undefined);
  const { data, isLoading, isError } = anaylaticsData;

  const analytics = data?.analytics;

  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("Today");

  const handleTimePeriodChange = (value: string) => {
    setSelectedTimePeriod(value);
  };

  const cards = [
    {
      name: "Total Visitors",
      value: analytics?.totalViews ?? 1,
      class: "bg-[#FDE006] text-[#525252]",
      icon: <Target />,
    },

    {
      name: "Unique visitors",
      value: analytics?.uniqueVisitors ?? 1,

      class: "bg-[#67C7FF] text-[#525252]",
      icon: <Target />,
    },
    {
      name: "Session Duration",
      value: formatDuration(analytics?.sessionDuration ?? 0),
      class: "bg-[#00A316] text-[#FFFFFF]",
      icon: <Clock />,
    },
  ];

  if (isLoading) {
    return <AnalyticsSkeletonPage />;
  }

  if (isError) {
    return (
      <div className="overview bg-background p-5 border border-input w-full  rounded-[14px] mb-5 ">
        <div className=" grid gap-2 my-10 sm:my-18.75">
          <div className="mx-auto text-center">
            <img
              src="/not-activity.png"
              className="w-auto max-h-25 sm:max-h-35 mx-auto"
              alt=""
            />
            <p className="font-medium text-2xl text-foreground leading-8 mt-6 mb-2.5">
              No data yet but you’re one send away.
            </p>
            <p className="text-sm leading-normal text-muted-foreground mb-4">
              Publish your page to start tracking opens, visitors, and
              engagement here.
            </p>
            <Link to="/pages">
              <Button>Publish Page</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* /// BREADCRUMBS AND FILTER BUTTON */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
        <nav className="flex items-center">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index !== 0 && (
                <div className="h-6 w-6 flex justify-center items-center mx-2.5">
                  <ChevronRight className="text-muted-foreground" />
                </div>
              )}
              <Link
                to={crumb.link}
                className="text-sm font-normal text-muted-foreground font-inter leading-5 hover:text-foreground"
              >
                {crumb.name}
              </Link>
            </div>
          ))}
          <div className="flex items-center">
            <div className="h-6 w-6 flex justify-center items-center mx-2.5">
              <ChevronRight className="text-muted-foreground" />
            </div>
            <p className="text-sm font-normal text-foreground font-inter leading-5 capitalize">
              {analytics?.pageName ?? "N/A"}
            </p>
          </div>
        </nav>

        <div>
          <Select
            value={selectedTimePeriod}
            onValueChange={handleTimePeriodChange}
          >
            <SelectTrigger className="w-full bg-background h-9">
              <SelectValue placeholder="Select a time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[
                  "Today",
                  "Last 7 Days",
                  "Last 30 Days",
                  "This Month",
                  "Last Month",
                ].map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ////  NOT FOUND DATA */}
      {/* <div className="overview bg-background p-5 border border-input w-full  rounded-[14px] mb-5 ">
        <div className=" grid gap-2 my-10 sm:my-18.75">
          <div className="mx-auto text-center">
            <img
              src="/not-activity.png"
              className="w-auto max-h-25 sm:max-h-35 mx-auto"
              alt=""
            />
            <p className="font-medium text-2xl text-foreground leading-8 mt-6 mb-2.5">
              No data yet but you’re one send away.
            </p>
            <p className="text-sm leading-normal text-muted-foreground mb-4">
              Publish your page to start tracking opens, visitors, and
              engagement here.
            </p>
            <Button>Publish Page</Button>
          </div>
        </div>
      </div> */}
      {/*  ANAYLITCS CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div className="p-3 rounded-xl bg-muted" key={index}>
              <div className="flex items-center gap-6.25">
                <div
                  className={`w-12 h-12 ${card.class} rounded-full flex justify-center items-center`}
                >
                  {Icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-foreground font-semibold text-2xl leading-8">
                    {card.value}
                  </h2>
                  <p className="text-muted-foreground font-normal text-lg leading-7">
                    {card.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        <div className="p-5 bg-muted border border-input rounded-[14px]">
          <h2 className="text-foreground font-semibold text-2xl leading-8 mb-6">
            Views by device type
          </h2>
          <ViewsByDevices
            metadata={{
              desktop: analytics?.viewsByDevice.desktop,
              tablet: analytics?.viewsByDevice.tablet,
              mobile: analytics?.viewsByDevice.mobile,
            }}
          />
        </div>
        <div className="p-5 bg-muted border border-input rounded-[14px]">
          <h2 className="text-foreground font-semibold text-2xl leading-8 mb-6">
            Visitor Trends
          </h2>

          <VistorsTrends data={analytics?.visitorTrends} />
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
