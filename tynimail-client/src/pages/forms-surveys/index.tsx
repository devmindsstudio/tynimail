import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertCircle, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LuSquarePen } from "react-icons/lu";
import FormsSelectOption from "./select-option";
import { useForms } from "@/hooks/use-forms";
import moment from "moment";
import toast from "react-hot-toast";
import { hanlderCopyToClipboard } from "@/utils/copy-clipboard";

const FormsSurveys = () => {
  const ITEMS_PER_PAGE = 7;

  const { GET_ALL_FROMS, COPY_MULTIPALE_FROMS } = useForms();

  const { data, isLoading, isError } = GET_ALL_FROMS();

  const formData = data?.forms ?? [];

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isHeaderHover, setIsHeaderHover] = useState(false);

  const [sortField, setSortField] = useState<"responses" | "status" | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const tableFileds = [
    { name: "Name", sortable: false },
    { name: "Last Modified", sortable: false },
    { name: "Responses", sortable: true, field: "responses" },
    { name: "Status", sortable: true, field: "status" },
    { name: "Actions", sortable: false },
  ];

  const toggleSelectAll = () => {
    if (selectedRows.size === formData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(formData.map((t: any) => t.id)));
    }
  };
  const filteredAndSortedForms = formData
    // ✅ SEARCH
    .filter((form: any) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    // ✅ SORT
    .sort((a: any, b: any) => {
      if (!sortField) return 0;

      if (sortField === "responses") {
        return sortOrder === "asc"
          ? a.totalResponses - b.totalResponses
          : b.totalResponses - a.totalResponses;
      }

      if (sortField === "status") {
        return sortOrder === "asc" ? a.status - b.status : b.status - a.status;
      }

      return 0;
    });
  const handleSort = (field: "responses" | "status") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
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
  const hanldeMakeCopy = () => {
    const selectedIds = Array.from(selectedRows);

    COPY_MULTIPALE_FROMS.mutate(
      {
        formIds: selectedIds,
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
    // const url = `/preview/${selectedIds[0]}/form`;
    // hanlderCopyToClipboard(url);
    // const selectedIds = Array.from(selectedRows);
    // const url = `/preview/${selectedIds[0]}/page`;
    // hanlderCopyToClipboard(url);
    const selectedIds = Array.from(selectedRows);

    if (selectedIds.length === 0) return;

    const selectedPage = paginatedForms.find(
      (page: any) => page.id === selectedIds[0],
    );

    if (!selectedPage) return;

    if (selectedPage.status === 1) {
      const url = `/preview/${selectedPage.id}/form`;
      hanlderCopyToClipboard(url);
    } else {
      toast.error("Only live pages can be shared.");
    }
  };
  const totalPages = Math.ceil(filteredAndSortedForms.length / ITEMS_PER_PAGE);

  const paginatedForms = filteredAndSortedForms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortOrder]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="max-w-81 w-full relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search Forms... "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => navigate(`/forms-builder`)}>
          <Plus size={18} />
          <span className="text-sm font-medium">Create New Form</span>
        </Button>
      </div>

      {selectedRows.size > 0 && (
        <FormsSelectOption
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
                <Checkbox
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    selectedRows.size > 0 ? "opacity-100" : ""
                  }`}
                  checked={selectedRows.size === formData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>

              {tableFileds.map((field: any, index: number) => {
                const isFirst = index === 0;
                return (
                  <th
                    className="p-4 text-center group first:text-left text-sm font-normal text-muted-foreground min-w-35 w-auto max-w-50"
                    key={index}
                  >
                    {field.sortable ? (
                      <button
                        onClick={() => handleSort(field.field)}
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
            ) : paginatedForms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                      No Forms found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedForms.map((form: any, index: number) => {
                return (
                  <tr
                    key={index}
                    className="group border-b last:border-b-0 border-border transition-colors"
                  >
                    <td className="text-center min-w-8 max-w-12  w-auto">
                      <div
                        className={`transition-opacity duration-200 ${
                          isHeaderHover || selectedRows.has(form.id)
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Checkbox
                          checked={selectedRows.has(form.id)}
                          onCheckedChange={() => toggleRow(form.id)}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-foreground">
                      <Link
                        to={`/forms-surveys/${form.id}/analytics`}
                        className="hover:underline underline-offset-2 capitalize"
                      >
                        {form.name}
                      </Link>
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {moment(form.updated_at).format("MMM D, YYYY, HH:mm")}
                    </td>
                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {form.totalResponses}
                    </td>

                    <td className="p-4 text-sm font-normal text-foreground text-center">
                      {form.status === 1 ? (
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
                        onClick={() =>
                          navigate(`/forms-builder/${form.id}/update`)
                        }
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
        length={filteredAndSortedForms.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default FormsSurveys;
