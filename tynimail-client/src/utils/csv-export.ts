import jsonToCsvExport from "json-to-csv-export";

export const CVSExport = (paginatedSubscribers: any) => {
  return jsonToCsvExport({ data: paginatedSubscribers });
};
