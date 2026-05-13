import ModelLayout from "@/pages/model/model-layout";
import moment from "moment";
import { IoCloseSharp } from "react-icons/io5";

const DomainDetail = ({
  domain,
  onClose,
}: {
  domain: any;
  onClose: () => void;
}) => {
  return (
    <ModelLayout>
      <div className="relative p-4 flex justify-center">
        <div className="w-full max-w-[800px] bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Domain Detail
            </h2>

            <button
              onClick={onClose}
              className="p-2 hover:bg-red-200 rounded-lg transition-colors bg-red-50"
            >
              <IoCloseSharp className="w-4 h-4 text-destructive" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Verify your domain to send emails from it. Access to DNS settings is
            required.
          </p>

          {/* Domain Info */}
          <div className="mb-6">
            <p>
              <strong>Domain:</strong> {domain.domain_name}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {domain.is_verified ? "Verified" : "Pending"}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {moment(domain.updated_at).format("MMM D, YYYY, HH:mm")}
            </p>
          </div>

          {/* DNS Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left text-sm">Record</th>
                  <th className="p-3 text-left text-sm">Hostname</th>
                  <th className="p-3 text-left text-sm">Type</th>
                  <th className="p-3 text-left text-sm">Value</th>
                </tr>
              </thead>

              <tbody>
                {/* DKIM Row */}
                <tr className="border-t">
                  <td className="p-3 text-sm font-medium min-w-[150px]">
                    DKIM
                  </td>
                  <td className="p-3 text-sm break-all">{domain.dkim_host}</td>
                  <td className="p-3 text-sm">TXT</td>
                  <td className="p-3 text-sm break-all">{domain.dkim_value}</td>
                </tr>

                {/* Return Path Row */}
                <tr className="border-t">
                  <td className="p-3 text-sm font-medium  min-w-[150px]">
                    Return-Path
                  </td>
                  <td className="p-3 text-sm break-all">
                    {domain.return_path_cname_name}
                  </td>
                  <td className="p-3 text-sm">CNAME</td>
                  <td className="p-3 text-sm break-all">
                    {domain.return_path_cname_value}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModelLayout>
  );
};

export default DomainDetail;
