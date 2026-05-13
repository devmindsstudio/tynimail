import { useEffect, useRef } from "react";

const CustomAlertError = ({
  message,
  className,
}: {
  message: string;
  className?: any;
}) => {
  const alertRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (message && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [message]);
  return (
    <div
      ref={alertRef}
      className={`p-4 rounded-lg flex items-center bg-[#dd5959] gap-2.5 ${className}`}
    >
      <svg
        className="size-6 min-w-6 min-h-6 fill-white"
        focusable="false"
        aria-hidden="true"
        viewBox="0 0 24 24"
        data-testid="CancelRoundedIcon"
      >
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m4.3 14.3c-.39.39-1.02.39-1.41 0L12 13.41 9.11 16.3c-.39.39-1.02.39-1.41 0a.9959.9959 0 0 1 0-1.41L10.59 12 7.7 9.11a.9959.9959 0 0 1 0-1.41c.39-.39 1.02-.39 1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41"></path>
      </svg>
      <p className="text-white font-medium text-sm">{message}</p>
    </div>
  );
};

export default CustomAlertError;
