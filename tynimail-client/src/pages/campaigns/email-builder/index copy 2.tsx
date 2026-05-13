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
// import { useAuthentication } from "@/hooks/use-auth";
// import { useUserTemplates } from "@/hooks/use-use-templates";

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
//   const { saveTempateId, getTempateId } = useAuthentication();
//   const { USER_CREATE_TEMPLATE, USER_UPDATE_TEMPLATE } = useUserTemplates();

//   console.log("localStorage", getTempateId);

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

//   const onReady = (ed: Editor) => {
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
//     if (getTempateId.id) {
//       ed.on("update", debouncedAutoSaveForNewCreateion);
//       ed.on("component:update", debouncedAutoSaveForNewCreateion);
//       ed.on("component:add", debouncedAutoSaveForNewCreateion);
//       ed.on("component:remove", debouncedAutoSaveForNewCreateion);
//       ed.on("component:style:update", debouncedAutoSaveForNewCreateion);
//     }

//     // initial
//     updateUndoRedoState();
//   };
//   const debouncedAutoSave = () => {
//     if (autoSaveTimeoutRef.current) {
//       clearTimeout(autoSaveTimeoutRef.current);
//     }
//     autoSaveTimeoutRef.current = window.setTimeout(() => {
//       autoSaveTemplate();
//     }, 5000);
//   };
//   const debouncedAutoSaveForNewCreateion = () => {
//     if (autoSaveTimeoutRef.current) {
//       clearTimeout(autoSaveTimeoutRef.current);
//     }
//     autoSaveTimeoutRef.current = window.setTimeout(() => {
//       saveAndContinue();
//     }, 5000);
//   };
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

//   const saveAsTemplate = async () => {
//     //  'https://dev-api.tynimail.com/api/v1/templates'  POST API IS RUNNING HO GYI.
//     const ed = editorRef.current;
//     if (!ed) return;

//     // const hasPreviewCommand = ed.Commands.has("core:preview");
//     // if (hasPreviewCommand) {
//     //   ed.runCommand("core:preview");
//     //   return;
//     // }
//     const content = JSON.stringify(editorRef.current?.getProjectData());
//     const html = ed.getHtml();
//     const css = ed.getCss();
//     const template = `<!DOCTYPE html>
//         <html>
//           <head>
//             <meta charset="utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>${css}</style>
//           </head>
//           <body>${html}</body>
//         </html>`;
//     try {
//       // const content = JSON.stringify(editorRef.current?.getProjectData());
//       const data = await CREATE_TEMPLATE.mutateAsync({ content: content });
//       toast.success(data.message);
//       saveTempateId({ id: data.id });
//       // toast.success("save as template  ssss");
//     } catch (error: any) {
//       toast.error(error.message);
//     }
//   };

//   const saveAndContinue = () => {
//     console.log("user template updatting");
//     const ed = editorRef.current;
//     if (!ed) return;
//     const content = JSON.stringify(editorRef.current?.getProjectData());
//     // const hasPreviewCommand = ed.Commands.has("core:preview");
//     // if (hasPreviewCommand) {
//     //   ed.runCommand("core:preview");
//     //   return;
//     // }

//     const html = ed.getHtml();
//     const css = ed.getCss();
//     const template = `<!DOCTYPE html>
//         <html>
//           <head>
//             <meta charset="utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>${css}</style>
//           </head>
//           <body>${html}</body>
//         </html>`;
//     toast.success("save and continue");

//     if (getTempateId) {
//       USER_UPDATE_TEMPLATE.mutate(
//         {
//           templateId: null,
//           userTemplatId: getTempateId.id,
//           content: content,
//         },
//         {
//           onError(error) {
//             console.log(error);
//           },
//           onSuccess(data) {
//             console.log("data", data);
//             toast.success("update tempalte");
//           },
//         }
//       );
//     }
//   };

//   const hanldeupdateTemplate = () => {
//     // toast.success("update template");
//     handleUpdate(false);
//   };
//   const updatedContinue = () => {
//     // toast.success("UPDATE COTINUE");
//     handleUpdate(true);
//   };

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
//   const handleUpdate = (redirect: boolean) => {
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
//             if (redirect) {
//               navigate("/campaigns/create-campaign?type=2");
//             }
//             toast.success("Template updated successfully");
//           },
//         }
//       );
//     } catch (error: any) {
//       toast.error(error?.message || "Failed to update template");
//     }
//   };

//   useEffect(() => {
//     USER_CREATE_TEMPLATE.mutate(
//       {
//         template_id: null,
//         content: "content",
//         status: 1,
//       },
//       {
//         onSuccess(data) {
//           saveTempateId({ id: data.id });
//         },
//       }
//     );
//   }, [!updated, !templateContent, isEditorReady]);

//   useEffect(() => {}, [getTempateId.id]);
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
//                     {/* <p className="text-xs font-normal">Saving</p> */}
//                   </div>
//                 ) : (
//                   <>
//                     <div className="h-2 w-2 rounded-full bg-green-500" />
//                     {/* <p className="text-xs font-normal">Save</p> */}
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
