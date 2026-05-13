import Pagination from "@/components/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmails } from "@/hooks/use-emails";
import { AlertCircle, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

const EmailListing = ({
  setPpenVerifyModel,
}: {
  setPpenVerifyModel: (data: any) => void;
}) => {
  const { GET_ALL_EMAILS } = useEmails();
  const { data, isLoading, isError } = GET_ALL_EMAILS({ verified: false });

  const ITEMS_PER_PAGE = 7;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const tableFileds = [
    {
      name: "Sender",
      sortable: false,
      icon: "",
    },
    {
      name: "Type",
      sortable: true,
      icon: "",
    },

    {
      name: "Status",
      sortable: true,
      icon: "",
    },
  ];

  const tableData = data?.senderEmails ?? [];

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
    return tableData;
  }, [tableData]);

  const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);

  const sortedSubscribers = useMemo(() => {
    return [...filteredSubscribers].sort((a: any, b: any) => {
      if (sortOrder === "asc") {
        // false comes first, true comes later
        if (a.is_verified === b.is_verified) return 0;
        return a.is_verified ? 1 : -1;
      } else {
        // true comes first, false comes later
        if (a.is_verified === b.is_verified) return 0;
        return a.is_verified ? -1 : 1;
      }
    });
  }, [filteredSubscribers, sortOrder]);

  const paginatedSubscribers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSubscribers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedSubscribers, currentPage]);

  return (
    <>
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
                    {field.sortable ? (
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

                  {/* <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                      <div className="h-8 w-8 rounded bg-border" />
                      <div className="h-8 w-8 rounded bg-border" />
                      <div className="h-8 w-8 rounded bg-border" />
                    </div>
                  </td> */}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
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
                <td colSpan={5} className="px-6 py-12 text-center">
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
                      <div
                        className={`transition-opacity duration-200 ${
                          isHeaderHover || selectedRows.has(subscriber.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Checkbox
                          // disabled={subscriber.}
                          checked={selectedRows.has(subscriber.id)}
                          onCheckedChange={() => toggleRow(subscriber.id)}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground ">
                      <p
                        onClick={() => setPpenVerifyModel(subscriber.email)}
                        className="hover:underline underline-offset-2 cursor-pointer"
                      >
                        {subscriber.email}
                      </p>
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {subscriber.first_name || subscriber.last_name
                        ? `${subscriber.first_name || ""} ${subscriber.last_name || ""}`.trim()
                        : "N/A"}
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {subscriber.is_verified ? (
                        <p className="bg-green-100 text-green-500 font-inter text-sm font-medium py-1 px-4 rounded-3xl inline-block leading-5">
                          Verified
                        </p>
                      ) : (
                        <p className="bg-secondary text-muted-foreground font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                          Pending
                        </p>
                      )}
                    </td>
                    {/* 
                    <td className="p-4 text-sm font-medium text-foreground text-center">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <Trash className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td> */}
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
    </>
  );
};

export default EmailListing;
