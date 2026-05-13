import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Editor } from "@maily-to/core";
import {
  VariableExtension,
  getVariableSuggestions,
  ImageUploadExtension,
} from "@maily-to/core/extensions";
import { Monitor, Redo, Smartphone, Undo } from "lucide-react";
import { Link } from "react-router";
import { handleImageUpload } from "@/utils/upload-image";
import { useEffect, useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontFamilies } from "@/utils/fonts";
import toast from "react-hot-toast";
import { usePagesTemplate } from "@/hooks/use-pagesTemplate";
import { usePages } from "@/hooks/use-pages";

const PageEditorOnly = ({
  pageId,
  templateContent,
  name,
  template_id,
  status,
}: {
  pageId?: string;
  name?: string;
  templateContent?: any;
  template_id: any;
  status: boolean;
}) => {
  console.log("object", pageId, templateContent, name, template_id);
  const { UN_PUBLIHSED_PAGE_BY_ID, PUBLIHSED_PAGE_BY_ID, UPDATE_PAGE_BY_ID } =
    usePages();
  const { CREATE_PAGE_AS_TEMPLATE_PAGE } = usePagesTemplate();

  const [pageName, setPageName] = useState("Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [currentFontFamily, setCurrentFontFamily] = useState<string>("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const handleDeviceChange = (type: "desktop" | "mobile") => {
    setSelectedDevice(type);
  };
  const handleFontFamilyChange = (value: string) => {
    if (!editor) return;
    try {
      if (value === "default") {
        editor.chain().focus().unsetFontFamily().run();
      } else {
        editor.chain().focus().setFontFamily(value).run();
      }
    } catch (error) {
      console.warn("Font family change failed", error);
    }
  };

  // Undo functionality
  const handleUndo = () => {
    if (editor && canUndo) {
      try {
        (editor.commands as any).undo();
      } catch (error) {
        console.warn("Undo failed", error);
      }
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (editor && canRedo) {
      try {
        (editor.commands as any).redo();
      } catch (error) {
        console.warn("Redo failed", error);
      }
    }
  };

  useEffect(() => {
    if (!editor) return;

    const updateUndoRedoState = () => {
      try {
        const commands = editor.commands as any;
        setCanUndo(typeof commands.undo === "function");
        setCanRedo(typeof commands.redo === "function");
      } catch (error) {
        setCanUndo(false);
        setCanRedo(false);
      }
    };

    const updateFontFamily = () => {
      try {
        const { fontFamily } = editor.getAttributes("textStyle");
        if (fontFamily) {
          const exactMatch = fontFamilies.find((f) => f.value === fontFamily);
          if (exactMatch) {
            setCurrentFontFamily(exactMatch.value);
          } else {
            setCurrentFontFamily(fontFamily);
          }
        } else {
          setCurrentFontFamily("default");
        }
      } catch (error) {
        setCurrentFontFamily("default");
      }
    };

    editor.on("update", () => {
      updateUndoRedoState();
      updateFontFamily();
    });
    editor.on("selectionUpdate", () => {
      updateUndoRedoState();
      updateFontFamily();
    });
    updateUndoRedoState();
    updateFontFamily();

    return () => {
      editor.off("update", updateUndoRedoState);
      editor.off("selectionUpdate", updateUndoRedoState);
    };
  }, [editor]);
  useEffect(() => {
    if (name) {
      setPageName(name);
    }
  }, [name]);

  const hanldeSaveAsTemplate = async () => {
    if (!editor) {
      toast.error("Editor not ready");
      return;
    }
    const html = editor.getHTML();
    const json = editor.getJSON();
    const content = JSON.stringify({ html, json });

    try {
      const data = await CREATE_PAGE_AS_TEMPLATE_PAGE.mutateAsync({
        name: pageName,
        content: content,
      });
      toast.success(data.message);

      // saveAsPageTemplate(data.template);
      //     const saveTempateId = (data: any) => {
      //   localStorage.setItem("save-tempate-id", JSON.stringify(data));
      // };
      // toast.success("save as template  ssss");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const hanldeUpdatePage = async () => {
    if (!editor) {
      toast.error("Editor not ready");
      return;
    }
    const html = editor.getHTML();
    const json = editor.getJSON();
    const content = JSON.stringify({ html, json });

    if (!pageId) return;
    try {
      const data = await UPDATE_PAGE_BY_ID.mutateAsync({
        pageId: pageId,
        name: pageName,
        content: content,
      });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const hanldePublish = async () => {
    if (!pageId) return;
    try {
      const data = await PUBLIHSED_PAGE_BY_ID.mutateAsync({ pageId: pageId });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const hanldeUnPublish = async () => {
    if (!pageId) return;
    try {
      const data = await UN_PUBLIHSED_PAGE_BY_ID.mutateAsync({
        pageId: pageId,
      });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page builder ">
      {/* /// HEADER */}
      <header className="bg-sidebar-backgdoud border-b border-input sticky top-0 z-50">
        <div className="flex items-center justify-between  ">
          <div className="border-r border-input w-full h-[72px] max-w-[72px] flex justify-center items-center">
            <Link to="/">
              <img
                src="/short-logo.png"
                alt=""
                className="dark:hidden block w-auto h-8"
              />
              <img
                src="/short-logo-white.png"
                alt=""
                className="hidden dark:block w-auto h-8"
              />
            </Link>
          </div>
          <div className="flex justify-end md:justify-between items-center w-full px-5">
            <div className=" items-center  bg-muted py-1.5 px-2  rounded-full hidden md:flex">
              <Button
                onClick={() => handleDeviceChange("desktop")}
                title="Desktop View"
                className={`rounded-full ${
                  selectedDevice === "desktop"
                    ? ""
                    : "bg-transparent border-transparent"
                }`}
                variant={selectedDevice === "desktop" ? "default" : "outline"}
              >
                <Monitor size={18} />
                <span className="text-sm font-medium hidden md:inline">
                  Desktop
                </span>
              </Button>
              <Button
                onClick={() => handleDeviceChange("mobile")}
                title="Mobile View"
                className={`rounded-full ${
                  selectedDevice === "mobile"
                    ? ""
                    : "bg-transparent border-transparent"
                }`}
                variant={selectedDevice === "mobile" ? "default" : "outline"}
              >
                <Smartphone size={18} />
                <span className="text-sm font-medium hidden md:inline">
                  Mobile
                </span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <ModeToggle />
              </div>
              <Button
                onClick={handleUndo}
                variant="outline"
                title="Undo"
                disabled={!canUndo}
                className="h-10 hidden sm:flex"
              >
                <Undo size={16} />
                <span className="hidden lg:inline">Undo</span>
              </Button>
              <Button
                onClick={handleRedo}
                variant="outline"
                title="Redo"
                className="h-10 hidden sm:flex"
                disabled={!canRedo}
              >
                <Redo size={16} />
                <span className="hidden lg:inline"> Redo</span>
              </Button>
              {/* Font Family Dropdown */}
              {editor && (
                <Select
                  value={currentFontFamily || "default"}
                  onValueChange={handleFontFamilyChange}
                >
                  <SelectTrigger className="h-10 w-[140px] hidden sm:flex">
                    <SelectValue placeholder="Font Family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span
                          style={{
                            fontFamily:
                              font.value === "default" ? "inherit" : font.value,
                          }}
                        >
                          {font.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {template_id && (
                <Button
                  className="h-10"
                  disabled={CREATE_PAGE_AS_TEMPLATE_PAGE.status === "pending"}
                  onClick={hanldeSaveAsTemplate}
                >
                  Save as Template
                </Button>
              )}
              {pageId && (
                <Button
                  disabled={UPDATE_PAGE_BY_ID.status === "pending"}
                  className="h-10"
                  onClick={hanldeUpdatePage}
                >
                  Update Page
                </Button>
              )}
              <>
                {status ? (
                  <Button
                    className="h-10"
                    disabled={UN_PUBLIHSED_PAGE_BY_ID.status === "pending"}
                    onClick={hanldeUnPublish}
                  >
                    Un Publish
                  </Button>
                ) : (
                  <Button
                    className="h-10"
                    disabled={PUBLIHSED_PAGE_BY_ID.status === "pending"}
                    onClick={hanldePublish}
                  >
                    Publish
                  </Button>
                )}
              </>
            </div>
          </div>
        </div>
      </header>

      <div className="pb-8 bg-muted min-h-[calc(100vh-74px)]">
        <div className="py-4.5 text-center mx-auto">
          {isEditing ? (
            <input
              type="text"
              value={pageName}
              autoFocus
              onChange={(e) => setPageName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
              className="bg-transparent border-b border-input outline-none text-5xl leading-[60px] font-semibold px-1 text-center"
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="text-5xl leading-[60px] inline-block underline font-semibold cursor-pointer hover:opacity-80"
            >
              {pageName}
            </h2>
          )}
        </div>
        {/* // TEMPLATE BUILDER */}
        <div
          className={` h-[calc(100vh-73px)] transition-all  bg-secondary ${selectedDevice === "mobile" ? " max-w-[600px] mx-auto p-4 " : " p-8 mx-0 max-w-full"}`}
        >
          <div className="editor-wrapper min-h-max h-full overflow-x-auto bg-white p-2.5 rounded border border-gray-200 ">
            <Editor
              config={{
                toolbarClassName: "toobarclass justify-center",
                bodyClassName: "body-class",
                contentClassName: "content-class",
                hasMenuBar: true,
                wrapClassName: "wrapper",
              }}
              contentJson={templateContent}
              // contentHtml={htmlContent}
              onCreate={(ed) => {
                setEditor(ed);
                if (
                  templateContent &&
                  typeof templateContent === "string" &&
                  templateContent.trim().startsWith("<")
                ) {
                  try {
                    ed.commands.setContent(templateContent);
                    if ("history" in ed) {
                      (ed as any).history.clear();
                    }
                    console.log("HTML template content loaded into editor");
                  } catch (error) {
                    console.error(
                      "Failed to load HTML template content:",
                      error,
                    );
                  }
                }
              }}
              onUpdate={(ed) => setEditor(ed)}
              extensions={[
                TextStyle,
                FontFamily.configure({
                  types: ["textStyle"],
                }),

                VariableExtension.configure({
                  suggestion: getVariableSuggestions("@"),
                }),

                ImageUploadExtension.configure({
                  onImageUpload: handleImageUpload,
                }),
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditorOnly;
