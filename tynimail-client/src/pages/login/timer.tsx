import { useState, useEffect } from "react";

const Clock = () => {
  // Format time as "HH : MM" with spaces around the colon
  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours} : ${minutes}`;
  };

  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(formatTime());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <h2 className="font-digital text-[86px] absolute inset-0 text-center text-white z-1 h-[130px]">
      {time}
    </h2>
  );
};

export default Clock;
