export default function CampaignsPageSkeleton() {
  const rows = 7;

  const sk = "bg-border animate-pulse rounded";

  return (
    <div>
      {/* TOP BAR */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-6">
        {/* Tabs */}
        <div className="flex items-center bg-muted rounded-lg p-1 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-8 w-20 ${sk}`} />
          ))}
        </div>

        {/* Create Button */}
        <div className={`h-10 w-40 ${sk}`} />
      </div>

      {/* SEARCH */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className={`h-10 w-full max-w-81 ${sk}`} />
      </div>

      {/* TABLE */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 w-12">
                <div className={`h-4 w-4 ${sk}`} />
              </th>
              <th className="p-4 min-w-35 max-w-50">
                <div className={`h-4 w-24 ${sk}`} />
              </th>
              <th className="p-4 min-w-35 max-w-110 text-center">
                <div className={`h-4 w-32 mx-auto ${sk}`} />
              </th>
              <th className="p-4 min-w-35 max-w-37.5 text-center">
                <div className={`h-4 w-20 mx-auto ${sk}`} />
              </th>
              <th className="p-4 min-w-35 max-w-37.5 text-center">
                <div className={`h-4 w-24 mx-auto ${sk}`} />
              </th>
              <th className="p-4 min-w-20 max-w-20 text-center">
                <div className={`h-4 w-12 mx-auto ${sk}`} />
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx} className="border-b last:border-b-0 border-border">
                <td className="p-4">
                  <div className={`h-4 w-4 ${sk}`} />
                </td>

                <td className="p-4">
                  <div className={`h-4 w-40 ${sk}`} />
                </td>

                <td className="p-4 text-center">
                  <div className={`h-4 w-56 mx-auto ${sk}`} />
                </td>

                <td className="p-4 text-center">
                  <div
                    className={`h-5 w-20 rounded-full mx-auto bg-border animate-pulse`}
                  />
                </td>

                <td className="p-4 text-center">
                  <div className={`h-4 w-24 mx-auto ${sk}`} />
                </td>

                <td className="p-4 text-center">
                  <div className={`h-6 w-6 ${sk} mx-auto`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between flex-col lg:flex-row pt-8 gap-4">
        <div className={`h-4 w-48 ${sk}`} />

        <div className="flex items-center gap-4">
          <div className={`h-4 w-28 ${sk}`} />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-10 w-10 rounded-lg ${sk}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
