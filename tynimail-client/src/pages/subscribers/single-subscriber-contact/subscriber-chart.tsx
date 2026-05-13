import { Pie, PieChart } from "recharts";
import { Mail, TrendingUp, Target, MousePointerClick } from "lucide-react";

const SubscriberChart = ({ metadata }: { metadata: any }) => {
  const Icon: any = {
    0: <Mail />,
    1: <TrendingUp />,
    2: <MousePointerClick />,
    3: <Target />,
  };
  const randomValue = (min = 20, max = 40) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const isAllZero = (metadata: any) => {
    if (!metadata) return true;

    return (
      metadata.open === 0 &&
      metadata.click === 0 &&
      metadata.unique === 0 &&
      metadata.delivered === 0
    );
  };
  const allZero = isAllZero(metadata);

  const data = [
    {
      name: "Delivered",
      value: allZero ? randomValue() : (metadata?.delivered ?? 0),
      fill: "#FF9304",
      stroke: "#FF9304",
    },
    {
      name: "Opened",
      value: allZero ? randomValue() : (metadata?.open ?? 0),
      fill: "#EA64D5",
      stroke: "#EA64D5",
    },
    {
      name: "Clicked",
      value: allZero ? randomValue() : (metadata?.click ?? 0),
      fill: "#A000FF",
      stroke: "#A000FF",
    },
    {
      name: "Unique Click",
      value: allZero ? randomValue() : (metadata?.unique ?? 0),
      fill: "#FDE006",
      stroke: "#FDE006",
    },
  ];

  return (
    <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
      <div className="w-full ">
        <PieChart
          style={{
            width: "100%",
            maxWidth: "500px",
            maxHeight: "300px",
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
      <div className="w-full md:max-w-90">
        <h2 className="font-semibold text-2xl leading-8 text-foreground">
          Quick overview
        </h2>
        <p className="font-normal text-xs leading-4 text-muted-foreground mt-2 mb-4">
          A snapshot of this subscriber’s activity and engagement.
        </p>
        <ul className="grid gap-1.5">
          {data.map((value, index) => {
            return (
              <li
                key={index}
                className="flex justify-between items-center p-2 rounded-[10px] bg-background"
              >
                <div className="flex items-center justify-start gap-3">
                  <div
                    className="flex justify-center items-center w-10 h-10 rounded-[10px] text-white"
                    style={{ backgroundColor: value.fill }}
                  >
                    {Icon[index]}
                  </div>
                  <p className="font-normal text-base text-foreground leading-4">
                    {value.name}
                  </p>
                </div>
                <p className="">{value.value}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SubscriberChart;
