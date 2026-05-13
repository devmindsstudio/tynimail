import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const VistorsTrends = ({ data }: { data: any[] }) => {
  return (
    <div>
      <AreaChart
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
        <Area
          connectNulls
          type="monotone"
          dataKey="uv"
          stroke="var(--color-foreground)"
          name="Total Visitor"
          fill="var(--color-muted-foreground)"
        />
      </AreaChart>
    </div>
  );
};

export default VistorsTrends;
