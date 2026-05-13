import { Pie, PieChart } from "recharts";
import {
  SlScreenTablet,
  SlScreenDesktop,
  SlScreenSmartphone,
} from "react-icons/sl";

const ViewsByDevices = ({
  metadata,
}: {
  metadata: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}) => {
  const data = [
    {
      name: "Desktop",
      value: metadata.desktop,
      fill: "#FF9304",
      stroke: "#FF9304",
      icon: <SlScreenDesktop />,
    },
    {
      name: "Tablet",
      value: metadata.tablet,
      fill: "#EA64D5",
      stroke: "#EA64D5",
      icon: <SlScreenTablet />,
    },
    {
      name: "Mobile",
      value: metadata.mobile,
      fill: "#A000FF",
      stroke: "#A000FF",
      icon: <SlScreenSmartphone />,
    },
  ];

  const totalViews = data.reduce((sum, item) => sum + item.value, 0);
  const calculatePercentage = (value: number) => {
    if (totalViews === 0) return 0;
    return ((value / totalViews) * 100).toFixed(1);
  };

  return (
    <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
      <div className="w-full ">
        <PieChart
          style={{
            width: "100%",
            maxWidth: "250px",
            // maxHeight: "200px",
            aspectRatio: 1,
          }}
          responsive
        >
          <Pie
            data={data}
            innerRadius="80%"
            outerRadius="100%"
            // Corner radius is the rounded edge of each pie slice
            cornerRadius="50%"
            // padding angle is the gap between each pie slice
            paddingAngle={5}
            dataKey="value"
            isAnimationActive={true}
          />
        </PieChart>
      </div>
      <div className="w-full lg:min-w-70 md:max-w-90">
        <ul className="grid gap-4">
          {data.map((value, index) => {
            const Icon = value.icon;
            const percentage = calculatePercentage(value.value);
            return (
              <li
                key={index}
                className="flex justify-between items-center p-3 rounded-[10px] bg-background"
              >
                <div className="flex items-center justify-start gap-3">
                  <div
                    className="flex justify-center items-center w-10 h-10 rounded-[10px] text-white text-xl leading-5"
                    style={{ backgroundColor: value.fill }}
                  >
                    {Icon}
                  </div>
                  <p className="font-normal text-base text-foreground leading-4">
                    {value.name}
                  </p>
                </div>
                <p className=""> {`${percentage}%`} </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ViewsByDevices;
