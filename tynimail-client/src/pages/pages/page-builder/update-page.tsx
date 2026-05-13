import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { usePages } from "@/hooks/use-pages";
import PageEditorOnly from "./editor-update-page";

const UpdatePageBuilderOnly = () => {
  const navigate = useNavigate();

  const { pageId } = useParams<{ pageId: string }>();

  const { GET_PAGE_BY_ID } = usePages();

  const { data, isError, isLoading, error } = GET_PAGE_BY_ID(pageId ?? "");

  const tempalte = data?.page || null;

  if (isLoading) {
    return <EmailEditorSkeleton />;
  }

  if (isError || !tempalte) {
    return (
      <div className="bg-sidebar-backgdoud border-b border-input p-5">
        <p className="text-red-500 text-base mb-5 font-medium">
          {error?.message}
        </p>
        <Button onClick={() => navigate("/")}> Back to Home</Button>
      </div>
    );
  }

  const json = JSON.parse(tempalte?.content);

  return (
    <PageEditorOnly
      pageId={pageId}
      name={tempalte.name}
      template_id={tempalte.template_id ?? null}
      templateContent={json.json}
      status={tempalte.status === 1 ? true : false}
    />
  );
};

export default UpdatePageBuilderOnly;

function EmailEditorSkeleton() {
  return (
    <div className="flex flex-col h-screen animate-pulse">
      {/* Header */}
      <div className="bg-sidebar-backgdoud border-b border-input">
        <div className="flex items-center justify-between">
          {/* Logo Box */}
          <div className="border-r border-input h-[72px] w-full max-w-[72px] flex justify-center items-center">
            <div className="h-8 w-8 bg-gray-300 rounded-md" />
          </div>

          <div className="flex justify-end md:justify-between items-center w-full px-5 gap-3">
            {/* Desktop/Mobile Toggle */}
            <div className="hidden md:flex items-center bg-muted py-1.5 px-2 rounded-full gap-2">
              <div className="h-8 w-20 bg-gray-300 rounded-full" />
              <div className="h-8 w-20 bg-gray-300 rounded-full" />
            </div>

            {/* Button Group */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-20 bg-gray-300 rounded-md" />
              <div className="h-10 w-20 bg-gray-300 rounded-md" />
              <div className="h-10 w-32 bg-gray-300 rounded-md" />
              <div className="h-10 w-24 bg-gray-300 rounded-md" />
              <div className="h-10 w-32 bg-gray-300 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto">
        <div className="h-[calc(100vh-73px)] p-8 bg-secondary">
          <div className="bg-white h-full border rounded-md p-4">
            {/* Fake Editor Content */}
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-gray-300 rounded" />
              <div className="h-4 w-full bg-gray-300 rounded" />
              <div className="h-4 w-full bg-gray-300 rounded" />
              <div className="h-4 w-5/6 bg-gray-300 rounded" />
              <div className="h-4 w-2/3 bg-gray-300 rounded" />

              <div className="w-full h-full bg-gray-200 rounded-md mt-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
