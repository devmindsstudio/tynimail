const FormSurveyBuilderSkeleton = () => {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border">
        {/* Logo section */}
        <div className="w-full max-w-max lg:max-w-[215px] border-r border-border py-3 px-3">
          <div className="h-10 w-32 bg-muted rounded mx-auto" />
        </div>

        {/* Tabs + Buttons */}
        <div className="flex items-center justify-between w-full px-5 lg:px-8">
          {/* Tabs Skeleton */}
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-muted rounded" />
            <div className="h-10 w-24 bg-muted rounded" />
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="h-10 w-24 bg-muted rounded" />
          </div>
        </div>
      </header>

      {/* Builder Body */}
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 w-1/3 bg-muted rounded" />
        <div className="h-32 w-full bg-muted rounded" />
        <div className="h-32 w-full bg-muted rounded" />
        <div className="h-32 w-full bg-muted rounded" />
      </div>
    </div>
  );
};

export default FormSurveyBuilderSkeleton;
