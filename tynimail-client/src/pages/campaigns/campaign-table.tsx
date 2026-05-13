import { useState, useMemo } from "react";
import { MoreVertical, AlertCircle } from "lucide-react";
import { ChevronsUpDown } from "lucide-react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CAMPAIGN_TYPE_TO_STATUS } from "@/types/all-types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
// import { useNavigate } from "react-router";
import DeleteCampaignModal from "@/components/delete-campaign-modal";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "scheduled" | "draft" | "live";
  createdDate: string;
}

interface CampaignsTableProps {
  searchQuery: string;
  statusFilter: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "bg-primary text-primary-forground";
    case "draft":
      // return "bg-primary  text-background";

      // return "bg-green-100 text-green-700 dark:text-white";
      return "bg-secondary text-primary-forground";
    case "live":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function CampaignsTable({
  searchQuery,
  statusFilter,
}: CampaignsTableProps) {
  const { GET_ALL_CAMPAIGNS } = useCampaigns();
  const { data, isPending, isError, refetch } = GET_ALL_CAMPAIGNS();
  const [compaignData, setCompaignData] = useState<any>(null);
  // const  =searchParams
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  // const [rowsPerPage, setRowsPerPage] = useState(7);
  const rowsPerPage = 7;
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isHeaderHover, setIsHeaderHover] = useState(false);
  // Transform API data to Campaign format
  const sourceCampaigns: Campaign[] = data?.campaigns
    ? data.campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        status: CAMPAIGN_TYPE_TO_STATUS[c.type] ?? "draft",
        createdDate: new Date(c.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }))
    : [];

  // Filter campaigns based on search and status
  const filteredCampaigns = useMemo(() => {
    return sourceCampaigns.filter((campaign) => {
      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        campaign.status.toLowerCase() === statusFilter.toLowerCase();

      // Search filter (searches in name and subject)
      const matchesSearch =
        searchQuery === "" ||
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [sourceCampaigns, searchQuery, statusFilter]);

  // Calculate total pages based on filtered data
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCampaigns.length / rowsPerPage),
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Sort and paginate filtered campaigns
  const displayedCampaigns = useMemo(() => {
    let sorted = [...filteredCampaigns];

    if (sortColumn) {
      sorted.sort((a, b) => {
        const aVal = a[sortColumn as keyof Campaign];
        const bVal = b[sortColumn as keyof Campaign];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return sorted.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage,
    );
  }, [filteredCampaigns, sortColumn, sortDirection, currentPage, rowsPerPage]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === displayedCampaigns.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(displayedCampaigns.map((c) => c.id)));
    }
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  
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
              <th className="text-center min-w-8 max-w-12  w-12">
                <Checkbox
                  className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    selectedRows.size > 0 ? "opacity-100" : ""
                  }`}
                  checked={selectedRows.size === displayedCampaigns.length}
                  onCheckedChange={toggleSelectAll}
                />
                {/* <Checkbox
                  checked={
                    displayedCampaigns.length > 0 &&
                    selectedRows.size === displayedCampaigns.length
                  }
                  // onCheckedChange={toggleSelectAll}
                  onCheckedChange={() => {
                    if (selectedRows.size === displayedCampaigns.length) {
                      setSelectedRows(new Set());
                    } else {
                      setSelectedRows(
                        new Set(displayedCampaigns.map((t) => t.id))
                      );
                    }
                  }}
                  disabled={isPending || isError}
                /> */}
              </th>
              <th className=" p-4 text-left text-xs font-semibold text-muted-foreground min-w-35 w-auto max-w-50">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 text-sm text-muted-foreground font-inter font-normal"
                  disabled={isPending || isError}
                >
                  Name
                  <ChevronsUpDown size={16} />
                </button>
              </th>
              <th className="p-4   text-xs font-semibold text-muted-foreground min-w-35 w-auto max-w-110 text-center">
                <button
                  onClick={() => handleSort("subject")}
                  className="flex items-center justify-center w-full gap-2 text-sm text-muted-foreground font-inter font-normal"
                  disabled={isPending || isError}
                >
                  Email Audience
                  <ChevronsUpDown size={16} />
                </button>
              </th>
              <th className="p-4 text-center text-xs font-semibold text-muted-foreground min-w-35 w-auto max-w-37.5">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center justify-center w-full gap-2 text-sm text-muted-foreground font-inter font-normal"
                  disabled={isPending || isError}
                >
                  Status
                  <ChevronsUpDown size={16} />
                </button>
              </th>
              <th className="p-4 text-center text-xs font-semibold text-muted-foreground min-w-35 w-auto max-w-37.5">
                <button
                  onClick={() => handleSort("createdDate")}
                  className="flex items-center justify-center w-full gap-2 text-sm text-muted-foreground font-inter font-normal"
                  disabled={isPending || isError}
                >
                  Created Date
                  <ChevronsUpDown size={16} />
                </button>
              </th>
              <th className="p-4  text-center text-sm text-muted-foreground font-inter font-normal min-w-20 w-auto max-w-20  ">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              // Loading skeleton rows
              Array.from({ length: rowsPerPage }).map((_, idx) => (
                <tr
                  key={`skeleton-${idx}`}
                  className="border-b last:border-b-0 border-border"
                >
                  <td className="p-4">
                    <div className="w-4 h-4 rounded bg-border animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-40 bg-border rounded animate-pulse " />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-56 bg-border rounded animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-24 bg-border rounded-full animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-24 bg-border rounded animate-pulse" />
                  </td>
                  <td className="p-4">
                    <div className="h-6 w-6 bg-border rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              // Error state
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-red-500 text-sm font-medium">
                      Failed to load campaigns
                    </p>
                    <p className="text-gray-400 text-xs mt-1 mb-4">
                      Something went wrong. Please try again.
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : displayedCampaigns.length === 0 ? (
              // No campaigns found
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-sm font-medium">
                      No campaigns found
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Create your first campaign to get started"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Display filtered campaigns
              displayedCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-b last:border-b-0 border-border transition-colors group"
                >
                  <td className="p-4">
                    {/* <Checkbox
                      checked={selectedRows.has(campaign.id)}
                      // onCheckedChange={() => toggleRow(campaign.id)}
                      onCheckedChange={() => {
                        toggleRow(campaign.id);
                        if (selectedRows.size === displayedCampaigns.length) {
                          setSelectedRows(new Set());
                        } else {
                          setSelectedRows(
                            new Set(displayedCampaigns.map((t) => t.id))
                          );
                        }
                      }}
                    /> */}
                    <div
                      className={`transition-opacity duration-200 ${
                        isHeaderHover || selectedRows.has(campaign.id)
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Checkbox
                        checked={selectedRows.has(campaign.id)}
                        onCheckedChange={() => toggleRow(campaign.id)}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-foreground">
                    {campaign.name}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate text-center">
                    {/* {campaign.subject} */}-
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        campaign.status,
                      )}`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground text-center">
                    {campaign.createdDate}
                  </td>
                  <td className="p-4 text-center">
                    {/* <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button> */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem
                          onClick={() => handleEdit(campaign.id)}
                        >
                          Edit
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() => {
                            setCompaignData(campaign);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION - YEH RAHA TUMHARA PAGINATION! */}
      {!isPending && !isError && filteredCampaigns.length > 0 && (
        <div className="flex items-center justify-between flex-col lg:flex-row  pt-8">
          <p className="text-sm text-muted-foreground w-full lg:max-w-30/100">
            {selectedRows.size} of {filteredCampaigns.length} row(s) selected.
          </p>
          <div className="flex items-center flex-wrap justify-center lg:flex-nowrap gap-4 w-full lg:max-w-70/100 lg:justify-end">
            {/* <h2 className="text-sm text-foreground font-normal font-inter">
              Rows per page
            </h2>

            <Select
              value={rowsPerPage.toString()}
              onValueChange={(val) => {
                setRowsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-17.5  h-10">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["10", "20", "30", "50", "100"].map((number) => (
                    <SelectItem key={number} value={number}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select> */}

            <h2 className="text-sm text-foreground font-normal font-inter">
              Page {currentPage} of {totalPages}
            </h2>

            <div className="flex gap-2 items-center justify-end">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {compaignData && (
        <DeleteCampaignModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          campaignName={compaignData.name}
          data={compaignData}
        />
      )}
    </>
  );
}
