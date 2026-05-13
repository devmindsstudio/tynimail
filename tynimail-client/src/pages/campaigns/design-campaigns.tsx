// import * as htmlToImage from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTemplates } from "@/hooks/use-templates";
import { Search } from "lucide-react";
import { BsFilter } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { Link } from "react-router";
//import TemplatePreview from "./template-preview";
import { useMemo } from "react";
import { useState } from "react";
// import { Editor } from "@tiptap/core";
// import StarterKit from "@tiptap/starter-kit";
// import TextAlign from "@tiptap/extension-text-align";
// import Image from "@tiptap/extension-image";
// import LinkExtension from "@tiptap/extension-link";
// import Underline from "@tiptap/extension-underline";
// import TextStyle from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";

const CampaignDesign = () => {
  // const [selecteTemaplateId, setSelectedTemplateId] = useState<string | null>(
  //   null
  // );
  const { GET_ALL_TEMPLATES } = useTemplates();
  const { data: templatesData, isLoading } = GET_ALL_TEMPLATES();
  const [search, setSearch] = useState("");

  // Handle both array response and object with templates property
  const templates = Array.isArray(templatesData)
    ? templatesData
    : templatesData?.templates || [];

  // const getTemplateName = (component: any): string => {
  //   // if (!component) return "";
  //   // if (component.type === "textnode" && component.content)
  //   //   return component.content;
  //   // if (component.components && component.components.length > 0) {
  //   //   for (const c of component.components) {
  //   //     const name = getTemplateName(c);
  //   //     if (name) return name;
  //   //   }
  //   // }
  //   return "";
  // };

  // Automatic TipTap JSON to HTML conversion using TipTap Editor
  // const convertContentToHTML = (content: string | any): string => {
  //   if (!content) return "";

  //   try {
  //     const parsed =
  //       typeof content === "string" ? JSON.parse(content) : content;

  //     // Check if it's TipTap JSON format
  //     if (parsed && typeof parsed === "object" && parsed.type === "doc") {
  //       // Use TipTap Editor to automatically convert JSON to HTML
  //       const editor = new Editor({
  //         extensions: [
  //           StarterKit,
  //           TextAlign.configure({
  //             types: ["heading", "paragraph"],
  //           }),
  //           Image,
  //           LinkExtension,
  //           Underline,
  //           TextStyle,
  //           Color,
  //         ],
  //         content: parsed,
  //       });
  //       const html = editor.getHTML();
  //       editor.destroy();
  //       return html;
  //     }

  //     // If it's already HTML, return as is
  //     if (typeof content === "string" && content.trim().startsWith("<")) {
  //       return content;
  //     }

  //     return typeof content === "string" ? content : "";
  //   } catch (error) {
  //     // If JSON parsing fails, assume it's HTML
  //     return typeof content === "string" ? content : "";
  //   }
  // };

  // const extractTextFromHTML = (content: string | any): string => {
  //   if (!content) return "Unnamed Template";

  //   try {
  //     // Try to parse as TipTap JSON first
  //     const parsed =
  //       typeof content === "string" ? JSON.parse(content) : content;

  //     if (parsed && typeof parsed === "object" && parsed.type === "doc") {
  //       // Extract text from TipTap JSON
  //       const extractText = (node: any): string => {
  //         if (node.type === "text") return node.text || "";
  //         if (node.content && Array.isArray(node.content)) {
  //           return node.content.map(extractText).join("");
  //         }
  //         return "";
  //       };

  //       const text = extractText(parsed) || "Unnamed Template";
  //       return text.trim() || "Unnamed Template";
  //     }
  //   } catch (error) {
  //     // If not JSON, treat as HTML
  //   }

  //   // Fallback to HTML extraction
  //   const html = typeof content === "string" ? content : "";
  //   const element = document.createElement("div");
  //   element.innerHTML = html;
  //   const text = element.textContent?.trim() || "";
  //   return text.length > 0 ? text : "Unnamed Template";
  // };
  const templatesWithNames = useMemo(() => {
    return templates.map((t: any) => {
      let contentJSON = JSON.parse(t.content);
      //        typeof t.content === "string" ? JSON.parse(t.content) : t.content;

      const name =
        contentJSON?.json?.content[0]?.content[0]?.text ?? "Unnamed Template";

      return { ...t, name: name, html: JSON.parse(t.content)?.html };
    });
  }, [templates]);
  const filteredTemplates = useMemo(() => {
    // return templatesWithNames.filter((t: any) =>
    //   t.name.toLowerCase().includes(search.toLowerCase())
    // );

    if (!search) return templatesWithNames;
    return templatesWithNames.filter((t: any) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, templatesWithNames]);

  return (
    <div className="bg-muted p-6 rounded-[10px]">
      <div className="flex items-center w-full justify-between gap-4">
        <div className="max-w-full w-full relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
            placeholder="Browse email templates..."
          />
        </div>
        <Button
          variant="outline"
          className="h-11 !px-4 cursor-pointer dark:bg-background"
        >
          <BsFilter size={20} />
          <span className="text-sm font-semibold font-inter">Filters</span>
        </Button>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Start from scratch card */}
          <Link to="/email-builder">
            <div className="bg-card relative h-[243px] w-full rounded-2xl overflow-hidden">
              <img
                src="/pattern.png"
                alt="pattern"
                className="dark:hidden block absolute inset-0 h-full w-full object-cover"
              />
              <img
                src="/pattern-2.png"
                alt="pattern"
                className="dark:block hidden  absolute inset-0 h-full w-full object-cover"
              />

              <div className="h-full py-12 relative z-10 flex justify-center items-center flex-col">
                <div className="border-2 border-primary rounded-[10px] w-10 h-10 flex justify-center items-center">
                  <FaPlus className="text-base leading-none fill-primary " />
                </div>
                <h2 className="text-primary text-base lg:text-xl text-center leading-[30px] font-medium mt-3">
                  Start From Scratch
                </h2>
              </div>
            </div>
          </Link>

          {isLoading ? (
            Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white rounded-2xl h-[243px] w-full p-2.5"
              >
                <div className="bg-gray-200 h-full w-full rounded-xl"></div>
              </div>
            ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template: any) => (
              <Link
                key={template.id}
                className="p-2.5 rounded-2xl bg-card cursor-pointer   overflow-hidden h-[243px]"
                to={`/email-builder/update-template/${template.id}`}
              >
                <div className=" h-full w-full overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: template.html,
                    }}
                  ></div>
                  {/* <TemplatePreview content={template.content} /> */}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500   bg-card rounded-[10px] flex justify-center items-center">
              No templates found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDesign;
