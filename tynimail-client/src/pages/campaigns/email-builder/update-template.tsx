// import { Button } from "@/components/ui/button";
import { useTemplates } from "@/hooks/use-templates";
// import { StudioEditor } from "@grapesjs/studio-sdk";
// import {
//   canvasEmptyState,
//   canvasFullSize,
//   layoutSidebarButtons,
//   rteProseMirror,
// } from "@grapesjs/studio-sdk-plugins";
// import type { Editor } from "grapesjs";
// import {
//   Eye,
//   FileSliders,
//   Monitor,
//   Redo,
//   Smartphone,
//   Undo,
// } from "lucide-react";
// import React, { useRef, useState } from "react";
import { useParams } from "react-router";
import EmailBuilder from ".";

const UpdateTemplate = () => {
  const { templateId } = useParams<{ templateId: string }>();

  const { GET_TEMPLATE_BY_ID } = useTemplates();

  const { data, isError, isLoading } = GET_TEMPLATE_BY_ID(templateId ?? "");

  const tempalte = data?.template || null;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !data) {
    return <div>Error loading template.</div>;
  }
  return (
    <EmailBuilder
      updated={true}
      templateId={templateId}
      templateContent={tempalte?.content}
    />
  );
};

export default UpdateTemplate;
