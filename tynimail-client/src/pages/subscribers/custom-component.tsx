import { components } from "react-select";

const CustomOption = (props: any) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-3 py-1">
        <span
          className="w-3 h-3 block rounded-full"
          style={{
            backgroundColor: data.color,
          }}
        />

        <span className="flex-1">{data.label}</span>
      </div>
    </components.Option>
  );
};

export default CustomOption;
