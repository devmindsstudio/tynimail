import { useMemo, useState } from "react";
import Pagination from "@/components/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ChevronsUpDown } from "lucide-react";
import SearchAble from "../search-able";
import SubWrapper from "../sub-wrapper";
import { Link } from "react-router";
import { formatNumber } from "@/lib/format-number";
import { useSegments } from "@/hooks/use-segments";
import SelectSegmentAction from "./select-action";
import { CVSExport } from "@/utils/csv-export";

const SegmentsPage = () => {
  const { GET_ALL_SEGMENTS } = useSegments();
  const { data, isLoading, isError } = GET_ALL_SEGMENTS();
  const ITEMS_PER_PAGE = 7;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };
  const tableFileds = [
    {
      name: "name",
      sortable: false,
    },
    {
      name: "Color",
      sortable: false,
    },
    {
      name: "Subscribers",
      sortable: true,
    },
    {
      name: "Open Rate",
      sortable: true,
    },
    {
      name: "Click Rate",
      sortable: true,
    },
  ];
  const SegmentData = data?.segments ?? [];

  const toggleRow = (id: any) => {
    const updated = new Set(selectedRows);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedRows(updated);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === SegmentData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(SegmentData.map((t: any) => t.id)));
    }
  };
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return SegmentData;

    const query = searchQuery.trim();
    const isNumber = !isNaN(Number(query));

    return SegmentData.filter((segment: any) => {
      if (isNumber) {
        return (
          segment.subscriber_count == query ||
          segment.metadata?.open == query ||
          segment.metadata?.click == query
        );
      }

      return segment.name?.toLowerCase().includes(query.toLowerCase());
    });
  }, [SegmentData, searchQuery]);
  const totalPages = Math.ceil(filteredSegments.length / ITEMS_PER_PAGE);

  // const sortedSegments = useMemo(() => {
  //   if (!sortBy) return filteredSegments;

  //   return [...filteredSegments].sort((a: any, b: any) => {
  //     const aVal =
  //       sortBy === "subscribers" ? a.subscriber_count : a.metadata?.[sortBy];

  //     const bVal =
  //       sortBy === "subscribers" ? b.subscriber_count : b.metadata?.[sortBy];

  //     console.log("object", a, b);
  //     if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;

  //     if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
  //     return 0;
  //   });
  // }, [filteredSegments, sortBy, sortOrder]);
  const sortedSegments = useMemo(() => {
    if (!sortBy) return filteredSegments;

    return [...filteredSegments].sort((a: any, b: any) => {
      const aVal =
        sortBy === "subscribers"
          ? Number(a.subscriber_count)
          : a.metadata?.[sortBy];

      const bVal =
        sortBy === "subscribers"
          ? Number(b.subscriber_count)
          : b.metadata?.[sortBy];

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSegments, sortBy, sortOrder]);
  const paginatedSegments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSegments.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedSegments, currentPage]);

  const hanldeExport = () => {
    const selectedSubscribers = SegmentData.filter((sub: any) =>
      selectedRows.has(sub.id),
    );
    const formattedData = selectedSubscribers.map((item: any) => ({
      name: item.name ?? "N/A",
      color: item.color,
      subscribers: item.subscriber_count,
      open_rate: item.metadata.open,
      click_rate: item.metadata.click,
    }));

    CVSExport(formattedData);
  };
  return (
    <SubWrapper>
      <SearchAble
        placeholder="Search segment..."
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterHide={false}
      />
      {selectedRows.size > 0 && (
        <SelectSegmentAction
          csvExporter={hanldeExport}
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
              <th className="text-center min-w-12 max-w-12  w-12">
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
                  checked={selectedRows.size === SegmentData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>

              {tableFileds.map((field, index) => {
                const isFirst = index === 0;
                return (
                  <th
                    className="p-4 text-center group first:text-left text-sm font-normal text-muted-foreground min-w-35 w-full max-w-25/100"
                    key={index}
                  >
                    <button
                      onClick={() =>
                        handleSort(
                          field.name === "Subscribers"
                            ? "subscribers"
                            : field.name === "Open Rate"
                              ? "open"
                              : field.name === "Click Rate"
                                ? "click"
                                : "",
                        )
                      }
                      className={`flex items-center gap-2 text-sm text-muted-foreground font-inter font-normal capitalize   ${isFirst ? " " : " mx-auto"}`}
                      // disabled={isPending || isError}
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
                  key={`skeleton-${idx}`}
                  className="border-b last:border-b-0 border-border"
                >
                  <td className="p-4">
                    <div className="h-4 min-w-8 max-w-12 bg-border rounded animate-pulse " />
                  </td>

                  <td className="p-4">
                    <div className="h-4 min-w-35 w-full  max-w-25/100 bg-border rounded animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 min-w-35 w-full  max-w-25/100 bg-border rounded animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 min-w-35 w-full mx-auto max-w-25/100 bg-border rounded-full animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 min-w-35 w-full mx-auto max-w-25/100 bg-border rounded animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 min-w-35 w-full mx-auto max-w-25/100 bg-border rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-red-500 text-sm font-medium">
                      Failed to load Segments
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
            ) : paginatedSegments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                      No Segments found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSegments.map((segment: any, index: number) => {
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
                          isHeaderHover || selectedRows.has(segment.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Checkbox
                          checked={selectedRows.has(segment.id)}
                          onCheckedChange={() => toggleRow(segment.id)}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground">
                      <Link
                        to={`/subscribers/segments/${segment.id}/contact`}
                        className="hover:underline underline-offset-2"
                      >
                        {segment.name}
                      </Link>
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      <div
                        style={{ backgroundColor: segment.color }}
                        className="w-5 h-5 rounded-full mx-auto"
                      ></div>
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {/* {formatNumber(Number(100))} */}
                      {formatNumber(Number(segment.subscriber_count))}
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {segment.metadata.click}%
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {/* {subscriber.openRate} */}
                      {segment.metadata.open}%
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
          length={filteredSegments.length}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </SubWrapper>
  );
};

export default SegmentsPage;
