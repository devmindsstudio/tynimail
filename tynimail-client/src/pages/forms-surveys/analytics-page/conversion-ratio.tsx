import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ConversionRatio = ({ data }: { data: any }) => {
  return (
    <div>
      <LineChart
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "250px",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        className=""
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <YAxis
          width="auto"
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <Tooltip wrapperClassName="!bg-background" />
        <Legend />
        {/* <Line
          type="monotone"
          dataKey="pv"
          activeDot={{ r: 8 }}
          stroke="var(--color-foreground)"
          fill="var(--color-muted-foreground)"
        /> */}
        <Line
          type="monotone"
          dataKey="uv"
          stroke="var(--color-foreground)"
          fill="var(--color-muted-foreground)"
        />
      </LineChart>
    </div>
  );
};

export default ConversionRatio;
