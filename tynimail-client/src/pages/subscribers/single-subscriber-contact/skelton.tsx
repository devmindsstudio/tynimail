const SkeletonSubscriber = () => {
  return (
    <div className="max-w-tiny-mail mx-auto px-5 sm:px-10 lg:px-20 py-10 animate-pulse">
      <div className="content space-y-6">
        {/* Back Button */}
        <div className="h-10 w-24 bg-gray-300 rounded-md"></div>

        {/* Top section: Chart + Subscriber Details */}
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-stretch">
          {/* Chart */}
          <div className="overview bg-muted p-5 border border-input w-full lg:max-w-175 rounded-[14px]">
            <div className="h-48 bg-gray-300 rounded-lg"></div>
          </div>

          {/* Subscriber Details */}
          <div className="subscriber p-5 border border-input w-full lg:max-w-137.5 rounded-[14px] flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-gray-300 rounded-md"></div>
              <div className="h-10 w-20 bg-gray-300 rounded-md"></div>
            </div>

            {/* Name */}
            <div className="flex justify-between gap-4 mt-2">
              <div className="h-6 w-1/2 bg-gray-300 rounded-md"></div>
              <div className="h-6 w-1/2 bg-gray-300 rounded-md"></div>
            </div>
            <div className="flex justify-between gap-4 mt-2">
              <div className="h-6 w-1/2 bg-gray-300 rounded-md"></div>
              <div className="h-6 w-1/2 bg-gray-300 rounded-md"></div>
            </div>

            <hr className="border border-input my-2" />

            {/* Source & Dates */}
            <div className="flex justify-between gap-4">
              <div className="h-6 w-28 bg-gray-300 rounded-md"></div>
              <div className="h-6 w-28 bg-gray-300 rounded-md"></div>
            </div>

            <div className="h-6 w-48 bg-gray-300 rounded-md mt-2"></div>
          </div>
        </div>

        {/* Bottom Section: Activity + Segments + Notes */}
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start mt-8">
          {/* Activity Timeline */}
          <div className="overview bg-muted p-5 border border-input w-full lg:max-w-175 rounded-[14px] space-y-4">
            <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="h-4 w-48 bg-gray-300 rounded-md"></div>
              </div>
            ))}
          </div>

          {/* Segments + Notes */}
          <div className="w-full lg:max-w-137.5 flex flex-col gap-8">
            {/* Segments */}
            <div className="p-5 border border-input rounded-[14px] space-y-3">
              <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
              {[...Array(2)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-6 w-full bg-gray-300 rounded-md"
                ></div>
              ))}
            </div>

            {/* Notes */}
            <div className="p-5 border border-input rounded-[14px] flex flex-col gap-2">
              <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
              <div className="h-20 w-full bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonSubscriber;
