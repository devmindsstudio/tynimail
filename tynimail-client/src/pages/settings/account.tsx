import { useState } from "react";

import SettingsWrapper from "./settings-wrapper";
import VerifyNotification from "./verifications/verify-notification";
import EmailListing from "./email-listing";
import DomainListing from "./domain-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Account = () => {
  const [openVerifyModel, setPpenVerifyModel] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("domain");

  const tabs = [
    { label: "Domain", value: "domain" },
    { label: "Email", value: "email" },
  ];

  console.log("currentTab", currentTab);
  return (
    <SettingsWrapper>
      <p className="text-base leading-6 font-normal text-muted-foreground mb-4">
        A sender is the email address or domain your emails are sent from.
      </p>
      <div className="flex items-center bg-muted rounded-lg mb-5">
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full p-1 bg-muted rounded-lg "
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
      {/* <div className="rounded-lg border border-border overflow-y-hidden">
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
      </div> */}
      {currentTab === "domain" ? (
        <DomainListing setPpenVerifyModel={setPpenVerifyModel} />
      ) : (
        <EmailListing setPpenVerifyModel={setPpenVerifyModel} />
      )}
      {openVerifyModel && (
        <VerifyNotification
          type="email"
          value={openVerifyModel}
          onClose={() => setPpenVerifyModel(null)}
        />
      )}
    </SettingsWrapper>
  );
};

export default Account;
