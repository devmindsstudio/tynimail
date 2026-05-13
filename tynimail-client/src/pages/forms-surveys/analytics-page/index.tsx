import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Target, Mail, Clock } from "lucide-react";
import { Link, useParams } from "react-router";
import ViewsByDevices from "./views-devices";
import ConversionRatio from "./conversion-ratio";
import { useForms } from "@/hooks/use-forms";
import { AnalyticsSkeletonPage } from "@/pages/pages/analytics-page/skeleton";
import { Button } from "@/components/ui/button";
import TableResponse from "./table-response";

const FormsAnalyticsPage = () => {
  // GET_ANAYLATIC_FORM_BY_ID
  const { id } = useParams();

  const breadcrumbs = [
    { name: "Forms", link: "/forms-surveys" },
    { name: "Templates", link: "#" },
  ];

  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("Today");
  const { GET_ANAYLATIC_FORM_BY_ID } = useForms();

  const anaylaticsData = GET_ANAYLATIC_FORM_BY_ID(id ?? undefined);
  const { data, isLoading, isError } = anaylaticsData;

  const analytics = data?.analytics;

  const handleTimePeriodChange = (value: string) => {
    setSelectedTimePeriod(value);
  };

  const cards = [
    {
      name: "Total Views",
      // value: 17,
      value: analytics?.totalViews ?? 1,
      class: "bg-[#FDE006] text-[#525252]",
      icon: <Target />,
    },
    {
      name: "Unique Views",
      value: analytics?.uniqueViews ?? 1,

      class: "bg-[#FF9304] text-[#FFFFFF]",
      icon: <Mail />,
    },
    {
      name: "Total Responses",
      value: analytics?.totalResponses ?? 1,

      class: "bg-[#67C7FF] text-[#525252]",
      icon: <Target />,
    },
    {
      name: "Conversion Rate",
      value: analytics?.conversionRate ?? 1,

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
              <Button>Back</Button>
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
              {analytics?.formName ?? "N/A"}
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div className="p-3 rounded-xl bg-muted">
              <div className="flex items-center gap-6.25">
                <div
                  className={`w-12 h-12 ${card.class} rounded-full flex justify-center items-center`}
                >
                  {Icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-foreground font-semibold text-2xl leading-8">
                    {" "}
                    {card.value}{" "}
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
          {/* <ViewsByDevices metadata={{ desktop: 45, tablet: 10, mobile: 45 }} /> */}
        </div>
        <div className="p-5 bg-muted border border-input rounded-[14px]">
          <h2 className="text-foreground font-semibold text-2xl leading-8 mb-6">
            Visitor Trends
          </h2>

          <ConversionRatio data={analytics.visitorTrends} />
        </div>
      </div>
      {analytics.responses.length > 0 && (
        <div className="grid gap-8 mt-6">
          <div className="p-5 bg-muted border border-input rounded-[14px]">
            <h2 className="text-foreground font-semibold text-2xl leading-8 mb-6">
              Responses
            </h2>
            <TableResponse responses={analytics?.responses} />
          </div>
        </div>
      )}
    </>
  );
};

export default FormsAnalyticsPage;
