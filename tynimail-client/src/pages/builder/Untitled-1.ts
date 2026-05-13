// import "@maily-to/core/style.css";
// import "./maily.css";

// import { Editor } from "@maily-to/core";
// import { render } from "@maily-to/render";
// import { useState, useEffect, useRef } from "react";
// import {
//   VariableExtension,
//   getVariableSuggestions,
//   ImageUploadExtension,
// } from "@maily-to/core/extensions";
// import { Button } from "@/components/ui/button";
// import {
//   Save,
//   Eye,
//   Undo,
//   Redo,
//   Monitor,
//   Smartphone,
//   FileSliders,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import type { Editor as TiptapEditor } from "@tiptap/core";
// import { ModeToggle } from "@/components/mode-toggle";
// import { Link, useNavigate } from "react-router";
// import { useTemplates } from "@/hooks/use-templates";
// import { useAuthentication } from "@/hooks/use-auth";
// import { useUserTemplates } from "@/hooks/use-use-templates";
// import { useCampaigns } from "@/hooks/use-campaigns";

// export function EmailBuilderMailyTo({
//   updated,
//   templateId,
//   templateContent,
// }: {
//   updated: boolean;
//   templateId?: string;
//   templateContent?: any;
// }) {
//   const navigate = useNavigate();
//   const { CREATE_TEMPLATE, UPDATE_TEMPLATE } = useTemplates();
//   const { saveTempateId, getTempateId, GET_CAMPAIGN_DATA } =
//     useAuthentication();
//   const { USER_CREATE_TEMPLATE, USER_UPDATE_TEMPLATE } = useUserTemplates();
//   const { UPDATE_CAMPAIGN_BY_ID } = useCampaigns();

//   const [editor, setEditor] = useState<TiptapEditor | null>(null);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [selectedDevice, setSelectedDevice] = useState<"desktop" | "mobile">(
//     "desktop"
//   );
//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);
//   const [isAutoSaving, setIsAutoSaving] = useState(false);
//   const [previewHTML, setPreviewHTML] = useState<string>("");
//   const autoSaveTimeoutRef = useRef<number | null>(null);

//   // Image upload handler
//   const handleImageUpload = async (file: Blob | File): Promise<string> => {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (e: any) => resolve(e.target.result);
//       reader.readAsDataURL(file);
//     });
//   };

//   // Update undo/redo state
//   useEffect(() => {
//     if (!editor) return;

//     const updateUndoRedoState = () => {
//       try {
//         // Check if undo/redo commands exist (using type assertion for now)
//         const commands = editor.commands as any;
//         setCanUndo(typeof commands.undo === "function");
//         setCanRedo(typeof commands.redo === "function");
//       } catch (error) {
//         // Fallback if check fails
//         setCanUndo(false);
//         setCanRedo(false);
//       }
//     };

//     editor.on("update", updateUndoRedoState);
//     editor.on("selectionUpdate", updateUndoRedoState);
//     updateUndoRedoState();

//     return () => {
//       editor.off("update", updateUndoRedoState);
//       editor.off("selectionUpdate", updateUndoRedoState);
//     };
//   }, [editor]);

//   // Auto-save functionality
//   useEffect(() => {
//     if (!editor || !getTempateId?.id) return;

//     const debouncedAutoSave = () => {
//       if (autoSaveTimeoutRef.current) {
//         clearTimeout(autoSaveTimeoutRef.current);
//       }
//       setIsAutoSaving(true);
//       autoSaveTimeoutRef.current = window.setTimeout(() => {
//         saveAndContinue({ redirect: false });
//       }, 5000);
//     };

//     editor.on("update", debouncedAutoSave);

//     return () => {
//       editor.off("update", debouncedAutoSave);
//       if (autoSaveTimeoutRef.current) {
//         clearTimeout(autoSaveTimeoutRef.current);
//       }
//     };
//   }, [editor, getTempateId]);

//   // Undo functionality
//   const handleUndo = () => {
//     if (editor && canUndo) {
//       try {
//         (editor.commands as any).undo();
//       } catch (error) {
//         console.warn("Undo failed", error);
//       }
//     }
//   };

//   // Redo functionality
//   const handleRedo = () => {
//     if (editor && canRedo) {
//       try {
//         (editor.commands as any).redo();
//       } catch (error) {
//         console.warn("Redo failed", error);
//       }
//     }
//   };

//   // Save as template functionality
//   const handleSaveAsTemplate = async () => {
//     if (!editor) {
//       toast.error("Editor not ready");
//       return;
//     }
//     const html = editor.getHTML();
//     const json = editor.getJSON();
//     const content = JSON.stringify({ html, json });

//     try {
//       // const content = JSON.stringify(editorRef.current?.getProjectData());
//       const data = await CREATE_TEMPLATE.mutateAsync({
//         content: content,
//       });
//       toast.success(data.message);
//       saveTempateId({ id: data.id });
//       // toast.success("save as template  ssss");
//     } catch (error: any) {
//       toast.error(error.message);
//     }
//     // const json = editor.getJSON();
//     // console.log("Saved as template - HTML:", html);
//     // console.log("Saved as template - JSON:", json);
//     // toast.success("Saved as template successfully");
//     // Add your save as template API call here
//   };

//   // Save & Continue functionality
//   const handleSaveAndContinue = ({ redirect }: { redirect: boolean }) => {
//     if (!editor) {
//       toast.error("Editor not ready");
//       return;
//     }
//     // const html = editor.getHTML();
//     // const json = editor.getJSON();
//     // const content = JSON.stringify(json);
//     const html = editor.getHTML();
//     const json = editor.getJSON();
//     const content = JSON.stringify({ html, json });
//     // const json = editor.getJSON();
//     // console.log("Save & Continue - HTML:", html);
//     USER_UPDATE_TEMPLATE.mutate(
//       // {
//       //   templateId: templateId || null,
//       //   userTemplatId: getTempateId.id,
//       //   content: content,
//       // },
//       {
//         templateId: templateId ? templateId : null,
//         userTemplatId: getTempateId.id,
//         content: content,
//       },
//       {
//         onError(error) {
//           console.log(error);
//           // if (!redirect) {
//           //   setIsAutoSaving(false);
//           // }
//         },
//         onSuccess(data) {
//           console.log("data", data);
//           // if (!redirect) {
//           //   setIsAutoSaving(false);
//           // }
//           if (redirect) {
//             // UPDATE_CAMPAIGN.mutate({
//             //   id: "",
//             //   templateId: "",
//             // });
//             // navigate("/campaigns/create-campaign?type=2");
//             if (GET_CAMPAIGN_DATA) {
//               UPDATE_CAMPAIGN_BY_ID.mutate({
//                 id: GET_CAMPAIGN_DATA.id,
//                 templateId: data.id,
//               });
//               // navigate("/campaigns/create-campaign?type=2");
//             }
//           }
//         },
//       }
//     );
//     // console.log("Save & Continue - JSON:", json);
//     // toast.success("Saved and continued successfully");
//     // Add your save & continue API call here
//   };

//   // Update preview HTML when editor content changes
//   // useEffect(() => {
//   //   if (editor && isPreviewMode) {
//   //     const updatePreview = async () => {
//   //       try {
//   //         const json = editor.getJSON();
//   //         try {
//   //           const rendered = await Promise.resolve(render(json));
//   //           if (rendered && typeof rendered === "string" && rendered.trim()) {
//   //             setPreviewHTML(rendered);
//   //             return;
//   //           }
//   //         } catch (e) {
//   //           console.warn("Render failed, using HTML:", e);
//   //         }
//   //         const html = editor.getHTML();
//   //         setPreviewHTML(html || "");
//   //       } catch (error) {
//   //         console.error("Error updating preview:", error);
//   //         setPreviewHTML(editor.getHTML() || "");
//   //       }
//   //     };

//   //     updatePreview();
//   //     editor.on("update", updatePreview);

//   //     return () => {
//   //       editor.off("update", updatePreview);
//   //     };
//   //   }
//   // }, [editor, isPreviewMode]);

//   // Preview functionality - toggle preview mode
//   const handlePreview = async () => {
//     if (!editor) {
//       toast.error("Editor not ready");
//       return;
//     }

//     getContentJson();
//     // Update preview HTML when toggling to preview mode
//     // if (!isPreviewMode) {
//     //   try {
//     //     const json = editor.getJSON();
//     //     try {
//     //       const rendered = await Promise.resolve(render(json));
//     //       if (rendered && typeof rendered === "string" && rendered.trim()) {
//     //         setPreviewHTML(rendered);
//     //       } else {
//     //         setPreviewHTML(editor.getHTML() || "");
//     //       }
//     //     } catch (e) {
//     //       setPreviewHTML(editor.getHTML() || "");
//     //     }
//     //   } catch (error) {
//     //     setPreviewHTML(editor.getHTML() || "");
//     //   }
//     // }

//     setIsPreviewMode(!isPreviewMode);
//   };

//   const handleDeviceChange = (type: "desktop" | "mobile") => {
//     setSelectedDevice(type);
//   };

//   ///// NEW NEED TO IMPLEMENT THE API LIKE
//   // updated,
//   // templateId,
//   // templateContent,

//   const updatedContinue = () => {
//     saveAndContinue({ redirect: true });
//   };

//   const hanldeupdateTemplate = () => {
//     handleUpdate(false);
//   };
//   const saveAndContinue = ({ redirect }: { redirect: boolean }) => {
//     if (!editor) {
//       toast.error("Editor not ready");
//       return;
//     }
//     // const html = editor.getHTML();
//     const html = editor.getHTML();
//     const json = editor.getJSON();
//     const content = JSON.stringify({ html, json });

//     if (getTempateId?.id) {
//       if (!redirect) {
//         setIsAutoSaving(true);
//       }
//       USER_UPDATE_TEMPLATE.mutate(
//         {
//           templateId: templateId ? templateId : null,
//           userTemplatId: getTempateId.id,
//           content: content,
//         },
//         {
//           onError(error) {
//             console.log(error);
//             if (!redirect) {
//               setIsAutoSaving(false);
//             }
//           },
//           onSuccess(data) {
//             console.log("data", data);
//             if (!redirect) {
//               setIsAutoSaving(false);
//             }
//             if (redirect) {
//               if (GET_CAMPAIGN_DATA) {
//                 UPDATE_CAMPAIGN_BY_ID.mutate({
//                   id: GET_CAMPAIGN_DATA.id,
//                   templateId: data.id,
//                 });
//                 navigate("/campaigns/create-campaign?type=2");
//               }
//             }
//           },
//         }
//       );
//     }
//   };
//   const handleUpdate = (redirect: boolean) => {
//     if (!editor) {
//       toast.error("Editor not ready");
//       return;
//     }
//     // const html = editor.getHTML();
//     // console.log("html", html);

//     const html = editor.getHTML();
//     const json = editor.getJSON();
//     const content = JSON.stringify({ html, json });
//     if (!templateId) return toast.error("Template ID missing");
//     try {
//       UPDATE_TEMPLATE.mutate(
//         { templateId: templateId as string, content: content },
//         {
//           onError(error: any) {
//             console.log("error", error);
//             // toast.error(error?.message || "Failed to update template");
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
//     if (!editor) return;

//     // if (getTempateId?.id) return; // Already created, skip/

//     // For UPDATE case: pass templateId from params (dynamic), for NEW case: pass null
//     const templateIdToPass = updated && templateId ? templateId : null;

//     // USER_CREATE_TEMPLATE.mutate(
//     //   {
//     //     template_id: templateIdToPass,
//     //     content: JSON.stringify({ html: "html", json: "json" }),
//     //     status: 1,
//     //   },
//     //   {
//     //     onSuccess(data) {
//     //       saveTempateId({ id: data.id });
//     //     },
//     //   }
//     // );
//   }, [editor, templateId]);
//   // Parse template content for contentJson prop
//   const getContentJson = () => {
//     if (!updated || !templateContent) return null;

//     try {
//       // If content is a string, try to parse it as JSON
//       if (typeof templateContent === "string") {
//         // Check if it's HTML (starts with <)
//         if (templateContent.trim().startsWith("<")) {
//           // If it's HTML, we need to convert it to TipTap JSON
//           // For now, return null and let the editor handle HTML via setContent
//           // Or we can try to parse it if needed
//           console.log("Template content is HTML, will need to convert to JSON");
//           return null;
//         }
//         // Try parsing as JSON string
//         return JSON.parse(templateContent);
//       }
//       // If it's already an object, return it
//       return templateContent;
//     } catch (error) {
//       console.error("Failed to parse template content as JSON:", error);
//       return null;
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="bg-sidebar-backgdoud border-b border-input ">
//         <div className="flex items-center justify-between ">
//           <div className="border-r border-input h-[72px] w-full max-w-[72px] flex justify-center items-center">
//             <Link to="/">
//               <img
//                 src="/short-logo.png"
//                 alt=""
//                 className="dark:hidden block w-auto h-8"
//               />
//               <img
//                 src="/short-logo-white.png"
//                 alt=""
//                 className="hidden dark:block w-auto h-8"
//               />
//             </Link>
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
//               {/* <div className="flex items-center gap-1.5">
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
//               </div> */}
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
//                   {/* <Button
//                     onClick={handlePreview}
//                     variant={"outline"}
//                     className="h-10 "
//                   >
//                     <Eye />
//                     <span className="hidden lg:inline"> Preview</span>
//                   </Button> */}

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
//                     onClick={handleSaveAsTemplate}
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
//                   >
//                     <Eye />
//                     <span className="hidden lg:inline">Preview</span>
//                   </Button>
//                   <Button
//                     onClick={() => handleSaveAndContinue({ redirect: true })}
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
//       {/* Content Area - Editor or Preview */}
//       <div className="flex-1 overflow-auto">
//         {isPreviewMode ? (
//           // Preview Mode
//           <div className="h-full overflow-auto bg-gray-50 p-8 flex justify-center items-start">
//             <div
//               className={`bg-white shadow-lg transition-all ${
//                 selectedDevice === "mobile"
//                   ? "w-full max-w-[375px]"
//                   : "w-full max-w-[600px]"
//               }`}
//             >
//               {previewHTML ? (
//                 <div
//                   className="p-5"
//                   dangerouslySetInnerHTML={{ __html: previewHTML }}
//                 />
//               ) : (
//                 <div className="p-5">
//                   <p className="text-gray-500 italic">
//                     No content to preview. Please add some content to the
//                     editor.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           // Editor Mode
//           <div
//             className={`maily-container h-[calc(100vh-73px)] transition-all  bg-secondary ${selectedDevice === "mobile" ? " max-w-[600px] mx-auto p-4 " : " p-8 mx-0 max-w-full"}`}
//             // style={{
//             //   maxWidth: selectedDevice === "mobile" ? "600px" : "100%",
//             //   margin: selectedDevice === "mobile" ? "0 auto" : "0",
//             //   padding: selectedDevice === "mobile" ? "1rem" : "2rem",
//             // }}
//           >
//             <div
//               className="editor-wrapper h-full overflow-x-auto bg-white p-2.5 rounded border border-gray-200"
//               // style={{
//               //   maxWidth: selectedDevice === "mobile" ? "375px" : "100%",
//               //   margin: selectedDevice === "mobile" ? "0 auto" : "0",
//               // }}
//             >
//               <Editor
//                 config={{
//                   toolbarClassName: "toobarclass justify-center",
//                   bodyClassName: "body-class",
//                   contentClassName: "content-class",
//                   hasMenuBar: true,
//                   wrapClassName: "wrapper",
//                   // bubbleMenu: {
//                   //   shouldShow: () => true, // Hamesha visible rahega
//                   // },
//                 }}
//                 contentJson={getContentJson()}
//                 onCreate={(ed) => {
//                   setEditor(ed);
//                   // If content is HTML (not JSON), set it after creation
//                   if (
//                     updated &&
//                     templateContent &&
//                     typeof templateContent === "string" &&
//                     templateContent.trim().startsWith("<")
//                   ) {
//                     try {
//                       ed.commands.setContent(templateContent);
//                       if ("history" in ed) {
//                         (ed as any).history.clear();
//                       }
//                       console.log("HTML template content loaded into editor");
//                     } catch (error) {
//                       console.error(
//                         "Failed to load HTML template content:",
//                         error
//                       );
//                     }
//                   }
//                 }}
//                 onUpdate={(ed) => setEditor(ed)}
//                 extensions={[
//                   VariableExtension.configure({
//                     suggestion: getVariableSuggestions("@"),
//                   }),

//                   ImageUploadExtension.configure({
//                     onImageUpload: handleImageUpload,
//                   }),
//                 ]}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
