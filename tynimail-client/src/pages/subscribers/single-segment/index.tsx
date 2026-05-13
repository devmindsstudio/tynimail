import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Filter,
  Plus,
  Search,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react";

import { useState, useMemo } from "react";
import { Link, useParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AddSubsciberModel from "../add-subsciber-model";
import { useSegments } from "@/hooks/use-segments";
import SelectSubscriptionAction from "../all-subscibers/select-action";
import { CVSExport } from "@/utils/csv-export";
import FilterModel from "../filter-model";
type FilterFormValues = {
  status: number | null;
  missingFields: string[];
  segmentCondition: string;
  segment: any[];
};
const SingleSegment = () => {
  const [addFilter, setAddFilter] = useState(false);
  const [filters, setFilters] = useState<FilterFormValues | null>(null);

  const { id } = useParams();
  const ITEMS_PER_PAGE = 7;
  const { GET_SUBSCIBERS_BY_ID } = useSegments();

  // const subscribersQuery = GET_SUBSCIBERS_BY_ID(id ?? undefined, null);
  const subscribersQuery = GET_SUBSCIBERS_BY_ID(id ?? undefined, filters);
  const { data: subscribers, isLoading, isError, refetch } = subscribersQuery;
  const data = subscribers?.subscribers ?? [];

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set<string>());
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  const [addSubscriberModel, setAddSubscriberModel] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  if (!id) return <p className="text-red-500">Segment ID is missing</p>;

  const modelCloseHandler = () => setAddSubscriberModel(!addSubscriberModel);

  const breadcrumbs = [
    { name: "Subscribers", link: "/subscribers" },
    { name: "Segments", link: "/subscribers/segments" },
  ];

  const tableFields = [
    { name: "Subscriber", key: "email", sortable: false }, // change sortable to true
    { name: "Name", key: "fullName", sortable: false }, // use "fullName" for name column
    { name: "Status", key: "status", sortable: true },
    { name: "Opened Emails", key: "metadata.open", sortable: false },
    { name: "Clicks", key: "metadata.click", sortable: false },
  ];

  // Toggle row selection
  const toggleRow = (email: string) => {
    const updated = new Set(selectedRows);
    updated.has(email) ? updated.delete(email) : updated.add(email);
    setSelectedRows(updated);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((t: any) => t.id)));
    }
  };

  // Sorting function
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    // Filter based on search query
    let filtered = data.filter((sub: any) => {
      const fullName = `${sub.first_name || ""} ${sub.last_name || ""}`.trim();
      const statusText = sub.status === 1 ? "verified" : "unverified";

      // Check if search query is in email, full name, or status
      return (
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statusText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Sorting
    if (sortConfig) {
      filtered.sort((a: any, b: any) => {
        let aValue = keyPath(a, sortConfig.key);
        let bValue = keyPath(b, sortConfig.key);

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  function keyPath(obj: any, path: string) {
    if (path === "fullName") {
      return ((obj.first_name || "") + " " + (obj.last_name || "")).trim();
    }
    if (path === "status") {
      // Return string so sorting/search works
      return obj.status === 1 ? "Verified" : "Unverified";
    }
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }
  const hanldeExport = () => {
    const selectedSubscribers = paginatedData.filter((sub: any) =>
      selectedRows.has(sub.id),
    );
    const formattedData = selectedSubscribers.map((item: any) => ({
      email: item?.email || "N/A",
      name:
        `${item?.first_name || ""} ${item?.last_name || ""}`.trim() || "N/A",
      status: item?.status === 0 ? "Unverified" : "Verified",
      opened_emails: item?.metadata?.open ?? 0,

      click: item?.metadata?.click ?? 0,
    }));

    CVSExport(formattedData);
  };
  const hanldeFiler = () => {
    setAddFilter(!addFilter);
  };

  const filterSingleSegmentHanlder = (queryparm: any) => {
    setFilters(queryparm);
    hanldeFiler();
  };
  return (
    <>
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
              {subscribers?.segmentName}
            </p>
          </div>
        </nav>
        <Button onClick={modelCloseHandler} className="cursor-pointer">
          <Plus size={18} /> Add Subscriber
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="max-w-81 w-full relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="pl-10 h-10"
            placeholder="Search contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-10" onClick={hanldeFiler}>
            <Filter size={18} />{" "}
            <span className="text-sm font-medium">Filter</span>
          </Button>
          {/* <Button variant="outline" className="h-10">
            <ChevronDown size={18} />{" "}
            <span className="text-sm font-medium">Actions</span>
          </Button> */}
        </div>
      </div>
      {selectedRows.size > 0 && (
        <SelectSubscriptionAction
          segmentId={id}
          csvExporter={hanldeExport}
          single={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      )}
      {/* Table */}
      <div className="rounded-lg border border-border overflow-y-hidden">
        <table className="w-full">
          <thead>
            <tr
              className="border-b border-border group"
              onMouseEnter={() => setIsHeaderHover(true)}
              onMouseLeave={() => setIsHeaderHover(false)}
            >
              <th className="text-center min-w-8 max-w-12 w-12">
                <Checkbox
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    selectedRows.size > 0 ? "opacity-100" : ""
                  }`}
                  checked={selectedRows.size === data.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              {tableFields.map((field, idx) => {
                const isFirst = idx === 0;
                return (
                  <th
                    key={idx}
                    className="p-4 text-center group first:text-left text-sm font-normal text-muted-foreground min-w-35 w-auto max-w-50"
                  >
                    <button
                      className={`flex items-center gap-2 text-sm text-muted-foreground font-inter font-normal capitalize ${
                        isFirst ? "" : "mx-auto"
                      }`}
                      onClick={() => field.sortable && handleSort(field.key)}
                    >
                      {field.name}
                      {field.sortable && <ChevronsUpDown size={16} />}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0 border-border"
                >
                  <td className="p-4">
                    <div className="h-4 min-w-8 max-w-12 bg-border rounded animate-pulse" />
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
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-500 text-sm font-medium">
                    No Subscribers found
                  </p>
                </td>
              </tr>
            ) : (
              paginatedData.map((subscriber: any, idx: number) => (
                <tr
                  key={idx}
                  className="group border-b last:border-b-0 border-border transition-colors"
                >
                  <td className="text-center min-w-8 max-w-12 w-auto">
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
                    {subscriber.status === 1 ? (
                      <p className="bg-green-100 text-green-500 font-inter text-sm font-medium py-1 px-4 rounded-3xl inline-block leading-5">
                        Verified
                      </p>
                    ) : (
                      <p className="bg-red-100 text-red-500 font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                        Unverified
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-sm font-normal text-foreground text-center">
                    {subscriber.metadata.open}
                  </td>
                  <td className="p-4 text-sm font-normal text-foreground text-center">
                    {subscriber.metadata.click}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        size={selectedRows.size ?? 0}
        length={paginatedData.length}
        currentPage={currentPage}
        totalPages={Math.ceil(sortedData.length / ITEMS_PER_PAGE)}
        setCurrentPage={setCurrentPage}
      />

      {/* Add Subscriber Modal */}
      {addSubscriberModel && (
        <AddSubsciberModel
          segmentId={id}
          modelCloseHandler={modelCloseHandler}
        />
      )}
      {addFilter && (
        <FilterModel
          onSubmitFilter={filterSingleSegmentHanlder}
          name="single-segment"
          initialValues={filters}
          modelCloseHandler={hanldeFiler}
          resetFilter={refetch}
        />
      )}
    </>
  );
};

export default SingleSegment;
