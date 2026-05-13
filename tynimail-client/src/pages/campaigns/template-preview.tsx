import React from "react";

const renderComponent = (comp: any) => {
  if (!comp) return null;

  switch (comp.type) {
    case "mj-section":
      return (
        <div
          style={{
            padding: comp.attributes?.padding || "0px",
            textAlign: comp.attributes?.["text-align"] || "left",
          }}
        >
          {comp.components?.map((c: any, i: number) => (
            <React.Fragment key={i}>{renderComponent(c)}</React.Fragment>
          ))}
        </div>
      );
    case "mj-column":
      return (
        <div style={{ display: "inline-block", verticalAlign: "top" }}>
          {comp.components?.map((c: any, i: number) => (
            <React.Fragment key={i}>{renderComponent(c)}</React.Fragment>
          ))}
        </div>
      );
    case "mj-text":
      return (
        <p
          style={{
            padding: comp.attributes?.padding,
            fontSize: comp.attributes?.["font-size"],
            fontWeight: comp.attributes?.["font-weight"],
            color: comp.attributes?.color,
            fontFamily: comp.attributes?.["font-family"],
          }}
        >
          {comp.components?.map((c: any) => {
            if (c.type === "textnode") return c.content;
            return renderComponent(c);
          })}
        </p>
      );
    case "mj-image":
      return (
        <img
          src={comp.attributes?.src}
          style={{
            width: comp.attributes?.width || "auto",
            display: "block",
            margin: "0 auto",
          }}
        />
      );
    default:
      return comp.components?.map((c: any, i: number) => (
        <React.Fragment key={i}>{renderComponent(c)}</React.Fragment>
      ));
  }
};

const TemplatePreview = ({ content }: { content: any }) => {
  const templateData =
    typeof content === "string" ? JSON.parse(content) : content;
  const frame = templateData?.pages?.[0]?.frames?.[0]?.component;

  return <div>{renderComponent(frame)}</div>;
};

export default TemplatePreview;
