import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertCircle, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LuSquarePen } from "react-icons/lu";
import SelectOption from "./select-option";
import { usePages } from "@/hooks/use-pages";
import moment from "moment";

import { hanlderCopyToClipboard } from "@/utils/copy-clipboard";
import toast from "react-hot-toast";

const Pages = () => {
  const ITEMS_PER_PAGE = 7;

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { GET_ALL_PAGES, COPY_MULTIPALE_PAGES } = usePages();
  const { data, isLoading, isError } = GET_ALL_PAGES();

  const tableData = data?.pages ?? [];

  const tableFileds = [
    {
      name: "Name",
      sortable: false,
      icon: "",
    },
    {
      name: "Last Modified",
      sortable: false,
      icon: "",
    },
    {
      name: "Status",
      sortable: true,
      icon: "",
    },
    {
      name: "Actions",
      sortable: false,
      icon: "",
    },
  ];

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

  const processedPages = useMemo(() => {
    let result = [...tableData];

    // 1️⃣ Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((page: any) => {
        const statusText = page.status === 1 ? "live" : "draft";
        return (
          page.name?.toLowerCase().includes(query) || statusText.includes(query)
        );
      });
    }

    // 2️⃣ Sort by status
    result.sort((a: any, b: any) =>
      sortOrder === "asc" ? a.status - b.status : b.status - a.status,
    );

    return result;
  }, [tableData, searchQuery, sortOrder]);

  const paginatedPages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedPages.slice(start, start + ITEMS_PER_PAGE);
  }, [processedPages, currentPage]);

  const totalPages = Math.ceil(processedPages.length / ITEMS_PER_PAGE);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const toggleRow = (email: any) => {
    const updated = new Set(selectedRows);
    if (updated.has(email)) {
      updated.delete(email);
    } else {
      updated.add(email);
    }
    setSelectedRows(updated);
  };
  const hanldeMakeCopy = () => {
    const selectedIds = Array.from(selectedRows);

    COPY_MULTIPALE_PAGES.mutate(
      {
        pageIds: selectedIds,
      },
      {
        onSuccess(data) {
          toast.success(data.message);
        },
        onError(error) {
          toast.error(error.message);
        },
      },
    );
  };
  const hanldeSharedLink = () => {
    // const selectedIds = Array.from(selectedRows);
    // const url = `/preview/${selectedIds[0]}/page`;
    // hanlderCopyToClipboard(url);
    const selectedIds = Array.from(selectedRows);

    if (selectedIds.length === 0) return;

    const selectedPage = tableData.find(
      (page: any) => page.id === selectedIds[0],
    );

    if (!selectedPage) return;

    if (selectedPage.status === 1) {
      const url = `/preview/${selectedPage.id}/page`;
      hanlderCopyToClipboard(url);
    } else {
      toast.error("Only live pages can be shared.");
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="max-w-81 w-full relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search Pages... "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => navigate(`/pages/templates`)}>
          <Plus size={18} />
          <span className="text-sm font-medium">Create New Page</span>
        </Button>
      </div>

      {selectedRows.size > 0 && (
        <SelectOption
          makeCopyHanlder={hanldeMakeCopy}
          shareHanlder={hanldeSharedLink}
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

                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1">
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
                      Failed to load Pages
                    </p>
                    <p className="text-gray-400 text-xs mt-1 mb-4">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                </td>
              </tr>
            ) : paginatedPages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                      No Pages found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPages.map((page: any, index: number) => {
                return (
                  <tr
                    key={index}
                    className="group border-b last:border-b-0 border-border transition-colors"
                  >
                    <td className="text-center min-w-8 max-w-12  w-auto">
                      <div
                        className={`transition-opacity duration-200 ${
                          isHeaderHover || selectedRows.has(page.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Checkbox
                          checked={selectedRows.has(page.id)}
                          onCheckedChange={() => toggleRow(page.id)}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground">
                      <Link
                        to={`/pages/${page.id}/analytics`}
                        className="hover:underline underline-offset-2 capitalize"
                      >
                        {page.name}
                      </Link>
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {moment(page.updated_at).format("MMM D, YYYY, HH:mm")}
                    </td>

                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {page.status === 1 ? (
                        <p className="bg-green-100 text-green-500 font-inter text-sm font-medium py-1 px-4 rounded-3xl inline-block leading-5">
                          Live
                        </p>
                      ) : (
                        <p className="bg-secondary text-muted-foreground font-inter text-sm font-medium leading-5 py-1 px-3 rounded-3xl inline-block">
                          Draft
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-base font-medium text-foreground text-center">
                      <button
                        className="text-muted-foreground hover:bg-muted px-2.5 py-1.5 rounded flex items-center gap-1 mx-auto"
                        onClick={() => navigate(`/page-update/${page.id}`)}
                      >
                        <LuSquarePen className="size-4" />
                        <span className="">Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        size={selectedRows.size}
        length={paginatedPages.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default Pages;
