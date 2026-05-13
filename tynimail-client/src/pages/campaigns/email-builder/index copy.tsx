// import "./stye.css";
// import StudioEditor from "@grapesjs/studio-sdk/react";
// import { Eye } from "lucide-react";
// import { FileSliders } from "lucide-react";

// import {
//   rteProseMirror,
//   canvasEmptyState,
//   canvasFullSize,
//   layoutSidebarButtons,
// } from "@grapesjs/studio-sdk-plugins";
// import "@grapesjs/studio-sdk/style";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router";
// import { useRef, useState, useEffect } from "react";
// import type { Editor } from "grapesjs";
// import { Monitor, Smartphone, Undo, Redo } from "lucide-react";
// import { useTemplates } from "@/hooks/use-templates";
// import toast from "react-hot-toast";
// import { ModeToggle } from "@/components/mode-toggle";

// const EmailBuilder = ({
//   updated,
//   templateId,
//   templateContent,
// }: {
//   updated: boolean;
//   templateId?: string;
//   templateContent?: any;
// }) => {
//   const { CREATE_TEMPLATE, UPDATE_TEMPLATE } = useTemplates();

//   // Suppress React 19 ref warning from @grapesjs/studio-sdk
//   useEffect(() => {
//     const originalWarn = console.warn;
//     console.warn = (...args: any[]) => {
//       const message = args[0]?.toString() || "";
//       if (
//         message.includes("Accessing element.ref was removed in React 19") ||
//         message.includes("ref is now a regular prop")
//       ) {
//         return;
//       }
//       originalWarn.apply(console, args);
//     };
//     return () => {
//       console.warn = originalWarn;
//     };
//   }, []);

//   // Use ref for the editor instance (correct approach)
//   const editorRef = useRef<Editor | null>(null);
//   const [editor, setEditor] = useState<Editor | null>(null);
//   const navigate = useNavigate();
//   const [selectedDevice, setSelectedDevice] = useState<"desktop" | "mobile">(
//     "desktop"
//   );

//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);
//   const [isEditorReady, setIsEditorReady] = useState(false);
//   const [isAutoSaving, setIsAutoSaving] = useState(false);
//   const autoSaveTimeoutRef = useRef<number | null>(null);

//   // Auto-save function for template updates
//   const autoSaveTemplate = () => {
//     if (!templateId || !updated || !editorRef.current) return;

//     setIsAutoSaving(true);
//     const content = JSON.stringify(editorRef.current.getProjectData());
//     UPDATE_TEMPLATE.mutate(
//       { templateId: templateId as string, content },
//       {
//         onError(error: any) {
//           console.error("Auto-save failed:", error);
//           setIsAutoSaving(false);
//         },
//         onSuccess() {
//           console.log("Template auto-saved");
//           setIsAutoSaving(false);
//         },
//       }
//     );
//   };

//   // Debounced auto-save (5 seconds)
//   const debouncedAutoSave = () => {
//     if (autoSaveTimeoutRef.current) {
//       clearTimeout(autoSaveTimeoutRef.current);
//     }
//     autoSaveTimeoutRef.current = window.setTimeout(() => {
//       autoSaveTemplate();
//     }, 5000);
//   };

//   const onReady = (ed: Editor) => {
//     console.log("Editor loaded", ed, editor);
//     editorRef.current = ed;
//     setEditor(ed);
//     setIsEditorReady(true);

//     // Attach Undo/Redo state listeners
//     const updateUndoRedoState = () => {
//       try {
//         setCanUndo(ed.UndoManager.hasUndo());
//         setCanRedo(ed.UndoManager.hasRedo());
//       } catch (e) {
//         // ignore if UndoManager not ready yet
//       }
//     };

//     ed.on("update", updateUndoRedoState);
//     ed.on("component:update", updateUndoRedoState);
//     ed.on("storage:store", updateUndoRedoState);

//     // Auto-save listeners for template updates
//     if (updated && templateId) {
//       ed.on("update", debouncedAutoSave);
//       ed.on("component:update", debouncedAutoSave);
//       ed.on("component:add", debouncedAutoSave);
//       ed.on("component:remove", debouncedAutoSave);
//       ed.on("component:style:update", debouncedAutoSave);
//     }

//     // initial
//     updateUndoRedoState();
//   };

//   // Cleanup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (autoSaveTimeoutRef.current) {
//         clearTimeout(autoSaveTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Load template content from parent when editor is ready
//   useEffect(() => {
//     if (!updated || !templateContent || !isEditorReady) return;
//     if (!editorRef.current) return;

//     try {
//       const projectData =
//         typeof templateContent === "string"
//           ? JSON.parse(templateContent)
//           : templateContent;
//       // loadProjectData expects the project JSON shape
//       editorRef.current.loadProjectData(projectData);
//       toast.success("Template loaded successfully");
//       console.log("Loaded template into editor", projectData);
//     } catch (error) {
//       console.error("Error loading template:", error);
//       toast.error("Failed to load template");
//     }
//   }, [updated, templateContent, isEditorReady]);

//   const handlePreview = () => {
//     const ed = editorRef.current;
//     if (!ed) return;

//     const hasPreviewCommand = ed.Commands.has("core:preview");
//     if (hasPreviewCommand) {
//       ed.runCommand("core:preview");
//       return;
//     }

//     const html = ed.getHtml();
//     const css = ed.getCss();
//     const previewWindow = window.open("", "_blank");

//     if (previewWindow) {
//       previewWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <meta charset="utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>${css}</style>
//           </head>
//           <body>${html}</body>
//         </html>
//       `);
//       previewWindow.document.close();
//     }
//   };

//   const saveTemplate = async () => {
//     try {
//       const content = JSON.stringify(editorRef.current?.getProjectData());
//       const data = await CREATE_TEMPLATE.mutateAsync({ content });
//       return { success: data?.success, message: data?.message, data };
//     } catch (error: any) {
//       console.error("Save template error:", error);
//       return { success: false, message: error?.message || "Save failed" };
//     }
//   };

//   const handleSave = async () => {
//     const { message, success } = await saveTemplate();
//     if (success) {
//       toast.success(message || "Template saved");
//     } else {
//       toast.error(message || "Failed to save template");
//     }
//   };

//   const handleNext = async () => {
//     const { message, success } = await saveTemplate();
//     if (!success) {
//       toast.error(message || "Failed to save template");
//       return;
//     }
//     navigate("/campaigns/create-campaign?type=1");
//   };

//   const handleUpdate = () => {
//     if (!templateId) return toast.error("Template ID missing");
//     try {
//       const content = JSON.stringify(editorRef.current?.getProjectData());
//       UPDATE_TEMPLATE.mutate(
//         { templateId: templateId as string, content },
//         {
//           onError(error: any) {
//             toast.error(error?.message || "Failed to update template");
//           },
//           onSuccess(_) {
//             navigate("/campaigns/create-campaign?type=2");
//             toast.success("Template updated successfully");
//           },
//         }
//       );
//     } catch (error: any) {
//       toast.error(error?.message || "Failed to update template");
//     }
//   };

//   const handleUndo = () => {
//     if (editorRef.current && canUndo) {
//       try {
//         editorRef.current.UndoManager.undo();
//       } catch (e) {
//         console.warn("Undo failed", e);
//       }
//     }
//   };

//   const handleRedo = () => {
//     if (editorRef.current && canRedo) {
//       try {
//         editorRef.current.UndoManager.redo();
//       } catch (e) {
//         console.warn("Redo failed", e);
//       }
//     }
//   };

//   const handleDeviceChange = (device: "desktop" | "mobile") => {
//     const ed = editorRef.current;
//     if (!ed) return;

//     const deviceManager = ed.DeviceManager;
//     const devices = deviceManager.getAll();
//     const targetDevice = devices.find((d: any) => {
//       const deviceId = d.get("id") || d.get("name")?.toLowerCase() || "";
//       return (
//         (device === "desktop" &&
//           (deviceId === "desktop" ||
//             deviceId === "" ||
//             deviceId.includes("desktop"))) ||
//         (device === "mobile" &&
//           (deviceId === "mobile" || deviceId.includes("mobile")))
//       );
//     });

//     if (targetDevice) {
//       const deviceId =
//         targetDevice.get("id") || targetDevice.get("name")?.toLowerCase() || "";
//       deviceManager.select(deviceId);
//       setSelectedDevice(device);
//     }
//   };

//   const saveAsTemplate = () => {
//     //  'https://dev-api.tynimail.com/api/v1/templates'  POST API IS RUNNING HO GYI.
//     console.log("[saveAsTemplate]");
//     toast.success("save as template");
//   };

//   const saveAndContinue = () => {
//     console.log("saveAndContinue");
//     toast.success("save and continue");
//   };

//   const hanldeupdateTemplate = () => {
//     toast.success("update template");
//   };
//   const updatedContinue = () => {
//     toast.success("update");
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="bg-sidebar-backgdoud border-b border-input ">
//         <div className="flex items-center justify-between ">
//           <div className="border-r border-input h-[72px] w-full max-w-[72px] flex justify-center items-center">
//             <img
//               src="/short-logo.png"
//               alt=""
//               className="dark:hidden block w-auto h-8"
//             />
//             <img
//               src="/short-logo-white.png"
//               alt=""
//               className="hidden dark:block w-auto h-8"
//             />
//           </div>
//           <div className="flex justify-end md:justify-between items-center w-full px-5">
//             <div className=" items-center  bg-muted py-1.5 px-2  rounded-full hidden md:flex">
//               <Button
//                 onClick={() => handleDeviceChange("desktop")}
//                 title="Desktop View"
//                 className={`rounded-full ${
//                   selectedDevice === "desktop"
//                     ? ""
//                     : "bg-transparent border-transparent"
//                 }`}
//                 variant={selectedDevice === "desktop" ? "default" : "outline"}
//               >
//                 <Monitor size={18} />
//                 <span className="text-sm font-medium hidden md:inline">
//                   Desktop
//                 </span>
//               </Button>
//               <Button
//                 onClick={() => handleDeviceChange("mobile")}
//                 title="Mobile View"
//                 className={`rounded-full ${
//                   selectedDevice === "mobile"
//                     ? ""
//                     : "bg-transparent border-transparent"
//                 }`}
//                 variant={selectedDevice === "mobile" ? "default" : "outline"}
//               >
//                 <Smartphone size={18} />
//                 <span className="text-sm font-medium hidden md:inline">
//                   Mobile
//                 </span>
//               </Button>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1.5">
//                 {isAutoSaving ? (
//                   <div>
//                     <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
//                     <p className="text-xs font-normal">Saving</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="h-2 w-2 rounded-full bg-green-500" />
//                     <p className="text-xs font-normal">Save</p>
//                   </>
//                 )}
//               </div>
//               {/* {updated && templateId && (
                
//               )} */}
//               <div>
//                 <ModeToggle />
//               </div>

//               <Button
//                 onClick={handleUndo}
//                 variant="outline"
//                 title="Undo"
//                 disabled={!canUndo}
//                 className="h-10"
//               >
//                 <Undo size={16} />
//                 <span className="hidden lg:inline">Undo</span>
//               </Button>
//               <Button
//                 onClick={handleRedo}
//                 variant="outline"
//                 title="Redo"
//                 className="h-10"
//                 disabled={!canRedo}
//               >
//                 <Redo size={16} />
//                 <span className="hidden lg:inline"> Redo</span>
//               </Button>

//               {updated ? (
//                 <>
//                   <Button
//                     onClick={handlePreview}
//                     variant={"outline"}
//                     className="h-10 "
//                   >
//                     <Eye />
//                     <span className="hidden lg:inline"> Preview</span>
//                   </Button>

//                   <Button
//                     onClick={hanldeupdateTemplate}
//                     variant="outline"
//                     className="h-10 "
//                   >
//                     <FileSliders />
//                     <span className="hidden lg:inline"> Update Template</span>
//                   </Button>
//                   <Button
//                     onClick={updatedContinue}
//                     variant="outline"
//                     className="h-10 "
//                   >
//                     <FileSliders />
//                     <span className="hidden lg:inline"> Continue</span>
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Button
//                     onClick={saveAsTemplate}
//                     variant="outline"
//                     className="h-10"
//                     // className="h-10 bg-secondary border-transparent hover:bg-sidebar-backgdoud"
//                   >
//                     <FileSliders />
//                     <span className="hidden lg:inline"> Save as Template</span>
//                   </Button>
//                   <Button
//                     onClick={handlePreview}
//                     variant={"outline"}
//                     className="h-10"
//                     // className="h-10 border-transparent bg-secondary hover:bg-sidebar-backgdoud"
//                   >
//                     <Eye />
//                     <span className="hidden lg:inline">Preview</span>
//                   </Button>
//                   <Button
//                     onClick={saveAndContinue}
//                     variant="default"
//                     className="h-10 "
//                   >
//                     Save & Contine
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Editor Container */}
//       <div className="flex-1 overflow-hidden">
//         <StudioEditor
//           onReady={onReady}
//           options={{
//             // theme: theme === "dark" ? "dark" : "light",
//             theme: "light",
//             licenseKey:
//               "268adf331d5d4e56b2b827d58126302f5c28272e6dce4f12907a3327a5334a5e",
//             project: {
//               type: "email",
//               // type: "web",
//               id:
//                 templateId || "UNIQUE_PROJECT_IDddhdhdd of the proejct lets me",
//             },
//             identity: {
//               id: "UNIQUE_END_USER_ID",
//             },
//             assets: {
//               storageType: "cloud",
//             },
//             storage: {
//               type: "cloud",
//               autosaveChanges: 100,
//               autosaveIntervalMs: 10000,
//             },
//             actions: false,
//             settingsMenu: false,
//             plugins: [
//               rteProseMirror.init({}),
//               canvasEmptyState.init({}),
//               canvasFullSize.init({}),
//               layoutSidebarButtons.init({}),
//             ],
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default EmailBuilder;
