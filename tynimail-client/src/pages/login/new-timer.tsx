import React, { useEffect, useState } from "react";

interface TimeState {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
}

const NewTimer: React.FC = () => {
  const [time, setTime] = useState<TimeState>({
    hour: "",
    minute: "",
    ampm: "AM",
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      let hour = now.getHours();
      const ampm: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;

      const hourString = String(hour).padStart(2, "0"); // 👉 now 01–12
      const minuteString = String(now.getMinutes()).padStart(2, "0");

      setTime({
        hour: hourString,
        minute: minuteString,
        ampm,
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    // <div className="flex justify-center items-center gap-3 my-10 xl:my-16">
    // <div className="grid grid-cols-3 gap-3 my-10 xl:my-16 text-center">
    <div className="flex justify-center gap-3 my-10 xl:my-16 items-center">
      <h2 className="font-anton font-normal text-[#DD5959] bg-white px-4 py-3 rounded-[10px] text-[60px] leading-[60px] lg:text-[80px] lg:leading-[70px]  xl:text-[124px] xl:leading-[104px]">
        {time.hour}
      </h2>
      <h2 className="font-anton font-normal text-[#242424] bg-white px-4 py-3  rounded-[10px] text-[60px] leading-[60px] lg:text-[80px] lg:leading-[70px]  xl:text-[124px] xl:leading-[104px]">
        {time.minute}
      </h2>
      <h2 className="font-anton fotn-normal text-[#919193] px-4 py-3 text-[80px] ]text-[60px] leading-[60px] lg:text-[80px] lg:leading-[70px]  xl:text-[124px] xl:leading-[104px]">
        {time.ampm}
      </h2>
    </div>
  );
};

export default NewTimer;
