import { useMemo, useState } from "react";
import Pagination from "@/components/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ChevronsUpDown } from "lucide-react";
import SearchAble from "../search-able";
import SubWrapper from "../sub-wrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSubscribers } from "@/hooks/use-subscribers";
import SelectSubscriptionAction from "./select-action";
import FilterModel from "../filter-model";
import { CVSExport } from "@/utils/csv-export";
import { Link } from "react-router";

type FilterFormValues = {
  status: number | null;
  missingFields: string[];
  segmentCondition: string;
  segment: any[];
};
const AllSubscribersPage = () => {
  const [filters, setFilters] = useState<FilterFormValues | null>(null);

  const { GET_ALL_SUBSCRIBERS } = useSubscribers();
  const [addFilter, setAddFilter] = useState(false);
  // const { data, isLoading, isError, refetch } = GET_ALL_SUBSCRIBERS(null);
  const { data, isLoading, isError, refetch } = GET_ALL_SUBSCRIBERS(filters);
  const ITEMS_PER_PAGE = 7;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const tableFileds = [
    {
      name: "Email",
      sortable: false,
      icon: "",
    },
    {
      name: "Name",
      sortable: false,
      icon: "",
    },
    {
      name: "Open rate",
      sortable: false,

      icon: "",
    },
    {
      name: "Status",
      sortable: true,
      icon: "",
    },
    {
      name: "Segments",
      sortable: false,
      icon: "",
    },
  ];

  const tableData = data?.subscribers ?? [];

  const toggleSelectAll = () => {
    if (selectedRows.size === tableData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(tableData.map((t: any) => t.id)));
    }
  };
  const handleStatusSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  const toggleRow = (email: any) => {
    const updated = new Set(selectedRows);
    if (updated.has(email)) {
      updated.delete(email);
    } else {
      updated.add(email);
    }
    setSelectedRows(updated);
  };
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return tableData;

    const query = searchQuery.toLowerCase();

    return tableData.filter((subscriber: any) => {
      const statusText = subscriber.status === 1 ? "verified" : subscriber.is_blocklisted ? "blocklisted" : "unverified";

      return (
        subscriber.email?.toLowerCase().includes(query) ||
        subscriber.first_name?.toLowerCase().includes(query) ||
        subscriber.last_name?.toLowerCase().includes(query) ||
        statusText.includes(query) ||
        String(subscriber.status).includes(query)
      );
    });
  }, [tableData, searchQuery]);
  const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);

  const sortedSubscribers = useMemo(() => {
    return [...filteredSubscribers].sort((a: any, b: any) => {
      if (sortOrder === "asc") {
        return a.status - b.status;
      }
      return b.status - a.status;
    });
  }, [filteredSubscribers, sortOrder]);
  const paginatedSubscribers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSubscribers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedSubscribers, currentPage]);
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const hanldeFiler = () => {
    if (!addFilter) {
      console.log("Current filters:", filters);
    }
    setAddFilter(!addFilter);
  };

  const hanldeExport = () => {
    const selectedSubscribers = tableData.filter((sub: any) =>
      selectedRows.has(sub.id),
    );
    const formattedData = selectedSubscribers.map((item: any) => ({
      email: item?.email || "N/A",
      name:
        `${item?.first_name || ""} ${item?.last_name || ""}`.trim() || "N/A",
      open_rate: item?.metadata?.open ?? 0,
      status: item?.status === 0 ? "Unverified" : "Verified",

      segments: item?.segments.map((segment: any) => segment.name),
    }));

    CVSExport(formattedData);
  };

  const filterSubscriberHanlder = (queryparm: any) => {
    setFilters(queryparm);
    hanldeFiler();
  };
  return (
    <SubWrapper>
      <SearchAble
        placeholder="Search contact... "
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hanldeFiler={hanldeFiler}
        filterHide={false}
      />
      {selectedRows.size > 0 && (
        <SelectSubscriptionAction
          csvExporter={hanldeExport}
          single={false}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      )}
      <div className="rounded-lg border border-border overflow-y-hidden">
        <table className="w-full">
          <thead>
            <tr
              className="border-b border-border group"
              onMouseEnter={() => setIsHeaderHover(true)}
              onMouseLeave={() => setIsHeaderHover(false)}
            >
              <th className="text-center min-w-8 max-w-12  w-auto">
                {/* <Checkbox
                // checked={
                //   displayedCampaigns.length > 0 &&
                //   selectedRows.size === displayedCampaigns.length
                // }
                // onCheckedChange={toggleSelectAll}
                // disabled={isPending || isError}
                /> */}
                <Checkbox
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    selectedRows.size > 0 ? "opacity-100" : ""
                  }`}
                  checked={selectedRows.size === tableData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>

              {tableFileds.map((field, index) => {
                const isFirst = index === 0;
                return (
                  <th
                    className="p-4 text-center group first:text-left text-sm font-normal text-muted-foreground min-w-35 w-auto max-w-50"
                    key={index}
                  >
                    {field.name === "Status" ? (
                      <button
                        onClick={handleStatusSort}
                        className="flex items-center gap-2 mx-auto"
                      >
                        {field.name}
                        <ChevronsUpDown size={16} />
                      </button>
                    ) : (
                      <p
                        className={`flex items-center gap-2 ${isFirst ? "" : "mx-auto justify-center"}`}
                      >
                        {field.name}
                      </p>
                    )}
                    {/* <button
                      // onClick={() => handleSort("name")}
                      className={`flex items-center gap-2 text-sm text-muted-foreground font-inter font-normal capitalize   ${isFirst ? " " : " mx-auto"}`}
                      // disabled={isPending || isError}
                    >
                      {field.name}
                      {field.sortable && <ChevronsUpDown size={16} />}
                    </button> */}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <tr
                  className="border-b last:border-b-0 border-border"
                  key={idx}
                >
                  <td className="p-4">
                    <div className="h-4 min-w-8 max-w-12 bg-border rounded animate-pulse " />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-48 rounded bg-border" />
                  </td>
                  <td className="p-4 text-center">
                    <div className="mx-auto h-4 w-24 rounded bg-border" />
                  </td>
                  <td className="p-4 text-center">
                    <div className="mx-auto h-4 w-24 rounded bg-border" />
                  </td>
                  <td className="p-4 text-center">
                    <div className="mx-auto h-6 w-24 rounded-full bg-border" />
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <div className="h-8 w-8 rounded bg-border" />
                      <div className="h-8 w-8 rounded bg-border" />
                      <div className="h-8 w-8 rounded bg-border" />
                    </div>
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-red-500 text-sm font-medium">
                      Failed to load Subscribers
                    </p>
                    <p className="text-gray-400 text-xs mt-1 mb-4">
                      Something went wrong. Please try again.
                    </p>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : paginatedSubscribers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                      No Subscribers found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSubscribers.map((subscriber: any, index: number) => {
                return (
                  <tr
                    key={index}
                    className="group border-b last:border-b-0 border-border transition-colors"
                  >
                    <td className="text-center min-w-8 max-w-12  w-auto">
                      {/* <Checkbox
                    // checked={selectedRows.has(campaign.id)}
                    // onCheckedChange={() => toggleRow(campaign.id)}
                    /> */}
                      <div
                        className={`transition-opacity duration-200 ${
                          isHeaderHover || selectedRows.has(subscriber.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Checkbox
                          checked={selectedRows.has(subscriber.id)}
                          onCheckedChange={() => toggleRow(subscriber.id)}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground">
                      {/* {subscriber.email} */}
                      <Link
                        to={`/subscribers/${subscriber.id}/contact`}
                        className="hover:underline underline-offset-2"
                      >
                        {subscriber.email}
                      </Link>
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {subscriber.first_name || subscriber.last_name
                        ? `${subscriber.first_name || ""} ${subscriber.last_name || ""}`.trim()
                        : "N/A"}
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {subscriber.metadata.open ?? "N/A"}
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {subscriber.status === 1 ? (
                        <p className="bg-green-100 text-green-500 font-inter text-sm font-medium py-1 px-4 rounded-3xl inline-block leading-5">
                          Verified
                        </p>
                      ) : subscriber.is_blocklisted ? (
                        <p className="bg-orange-100 text-orange-600 font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                          Blocklisted
                        </p>
                      ) : (
                        <p className="bg-red-100 text-red-500 font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                          Unverified
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground text-center">
                      {subscriber.segments.length > 0 ? (
                        <div className="flex justify-center items-center gap-1">
                          {subscriber.segments
                            .slice(0, 2)
                            .map((segment: any, index: number) => {
                              const name = segment.name || "";
                              const initials = name
                                .split(" ")
                                .map((word: string) => word[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);

                              return (
                                <span
                                  key={index}
                                  style={{ backgroundColor: segment.color }}
                                  className={` text-white font-inter text-xs font-medium leading-3 p-1 rounded w-8 h-8 flex justify-center items-center  `}
                                >
                                  <span className="text-outline">
                                    <Link
                                      to={`/subscribers/segments/${segment.id}/contact`}
                                    >
                                      {initials}
                                    </Link>
                                  </span>
                                </span>
                              );
                            })}

                          {subscriber.segments.length > 2 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <span className="bg-secondary text-muted-foreground font-inter text-xs font-medium leading-3 p-1 rounded min-w-8 w-max h-8 flex justify-center items-center">
                                  +{subscriber.segments.length - 2}
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <div className="flex flex-col gap-1">
                                  {subscriber.segments
                                    .slice(2)
                                    .map((segment: any, index: number) => {
                                      const name = segment.name || "";
                                      const initials = name
                                        .split(" ")
                                        .map((word: string) => word[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2);

                                      return (
                                        <span
                                          key={index}
                                          style={{
                                            backgroundColor: segment.color,
                                          }}
                                          className={` text-white font-inter text-xs font-medium leading-3 p-1 rounded w-8 h-8 flex justify-center items-center`}
                                        >
                                          <span className="text-outline">
                                            <Link
                                              to={`/subscribers/segments/${segment.id}/contact`}
                                            >
                                              {initials}
                                            </Link>
                                          </span>
                                        </span>
                                      );
                                    })}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-1">
                          N/A
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="">
        <Pagination
          size={selectedRows.size}
          length={filteredSubscribers.length}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
      {addFilter && (
        <FilterModel
          name="subscriber"
          onSubmitFilter={filterSubscriberHanlder}
          modelCloseHandler={hanldeFiler}
          initialValues={filters}
          resetFilter={refetch}
        />
      )}
    </SubWrapper>
  );
};

export default AllSubscribersPage;
