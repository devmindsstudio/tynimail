import { useState, useEffect } from "react";
import { Link } from "react-router";
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ICreatorOptions } from "survey-creator-core";
import { Undo2, Redo2 } from "lucide-react";
import "./styles.css";
import "survey-core/survey.i18n";
import "survey-creator-core/survey-creator-core.i18n";
import { getLocaleStrings } from "survey-creator-core";
import { registerCreatorTheme, registerSurveyTheme } from "survey-creator-core";
import SurveyTheme from "survey-core/themes";
// import { customThemeVariables } from "./survay-css-variables";
import { ModeToggle } from "@/components/mode-toggle";
import FormShareModel from "@/components/model/form-share-model";
import { useForms } from "@/hooks/use-forms";
import toast from "react-hot-toast";
const defaultCreatorOptions: ICreatorOptions = {
  autoSaveEnabled: true,
  collapseOnDrag: true,
  showCreatorThemeSettings: false,
  collapsePanels: false,
  previewAllowHiddenElements: false,
  showJSONEditorTab: false,
  showLogicTab: false,
  showThemeTab: true,
  allowModifyPages: false,
};

const customTheme = {
  themeName: "customTheme",
  // cssVariables: { ...customThemeVariables },
};
const enLocale = getLocaleStrings("en");

function addCustomTheme(theme: any, userFriendlyThemeName: string) {
  enLocale.creatortheme.names[theme.themeName] = userFriendlyThemeName;
  registerCreatorTheme(theme);
}

addCustomTheme(customTheme, "Custom Theme");

// Register all predefined SurveyJS themes
registerSurveyTheme(SurveyTheme);

const FormSurveyBuilder = ({
  updated,
  data,
  fromSuvryId,
}: {
  fromSuvryId: any;
  updated: boolean;
  data: any;
}) => {
  const { CREATE_FORM, UPDATED_FORM } = useForms();
  let [creator, setCreator] = useState<SurveyCreator | null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [, setUndoRedoTick] = useState(0);
  const [activeTab, setActiveTab] = useState("design");

  const [createdForm, setCreatedForm] = useState<any>(null);
  if (!creator) {
    creator = new SurveyCreator(defaultCreatorOptions);
    creator.showTabs = false;
    creator.previewShowResults = false;
    creator.showToolbarDefault = false;
    creator.applyCreatorTheme(customTheme);
    creator.JSON = {
      title: "Form title",
      showCompleteButton: true,
    };

    setCreator(creator);
  }

  const toggleModel = () => setShareModal(!shareModal);

  useEffect(() => {
    if (!creator) return;
    const onChanged = () => setUndoRedoTick((t) => t + 1);
    creator.onModified.add(onChanged);
    return () => creator?.onModified.remove(onChanged);
  }, [creator]);

  const canUndo = creator?.undoRedoManager?.canUndo() ?? false;
  const canRedo = creator?.undoRedoManager?.canRedo() ?? false;

  const handleTabChange = (tab: string) => {
    if (!creator) return;
    let tabName = "designer";
    if (tab === "design") tabName = "designer";
    else if (tab === "preview") tabName = "preview";
    else if (tab === "theme") tabName = "theme";
    creator.makeNewViewActive(tabName);
    setActiveTab(tab);
  };

  const pulishedButtonHanlder = () => {
    if (!creator) return;

    const content = {
      content: creator.JSON,
      css: creator.theme,
    };

    const payload = {
      name: creator.JSON.title,
      content: content,
    };

    CREATE_FORM.mutateAsync(payload, {
      onError(error) {
        toast.error(error.message);
      },
      onSuccess(data) {
        toggleModel();
        setCreatedForm(data.form);
        toast.success(data.message);
      },
    });
  };

  const updateButtonHandler = () => {
    if (!creator) return;
    const content = {
      content: creator.JSON,
      css: creator.theme,
    };

    const payload = {
      formId: fromSuvryId,
      name: creator.JSON.title,
      content: content,
    };

    UPDATED_FORM.mutateAsync(payload, {
      onError(error) {
        toast.error(error.message);
      },
      onSuccess(data) {
        toggleModel();
        setCreatedForm(data.form);
        toast.success(data.message);
      },
    });
  };

  useEffect(() => {
    if (updated && data) {
      /// CONTENT
      creator.JSON = data.content;
      /// THEME
      creator.theme = data.css;
      setCreator(creator);
    }
  }, [updated, data, fromSuvryId]);

  useEffect(() => {
    const showOnlySpecificButtons = () => {
      const elements =
        document.querySelectorAll<HTMLElement>(".svc-menu-action");

      const allowedTitles = [
        "Navigation",
        "Question Settings",
        "Pages",
        "Conditions",
        "Data",
        "Validation",
        "Quiz Mode",
        "Choices from a Web Service",
      ];

      elements.forEach((el) => {
        const btn = el.querySelector<HTMLDivElement>(
          ".svc-menu-action__button",
        );

        if (btn) {
          if (allowedTitles.includes(btn.title)) {
            el.style.display = "none";
          } else {
            el.style.display = "";
          }
        }
      });
    };

    ////
    // Toolbox items
    const toolboxTools =
      document.querySelectorAll<HTMLElement>(".svc-toolbox__tool");

    const allowedTools = [
      "Dropdown",
      "Long Text",
      "Multiple Textboxes",
      "Panel",
      "Dynamic Panel",
      "Single-Select Matrix",
      "Multi-Select Matrix",
      "Dynamic Matrix",
      "Expression (read-only)",
      "Signature",
      "HTML",
    ];

    toolboxTools.forEach((tool) => {
      const item = tool.querySelector<HTMLElement>(".svc-toolbox__item");

      if (item) {
        const label = item.getAttribute("aria-label");

        if (allowedTools.includes(label || "")) {
          tool.style.display = "none";
        } else {
          tool.style.display = "";
        }
      }
    });

    const observer = new MutationObserver(showOnlySpecificButtons);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Run once initially
    showOnlySpecificButtons();

    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="flex flex-col ">
        <header className="flex items-center justify-between border-b border-border">
          <div className="w-full max-w-max lg:max-w-[215px] border-r border-border py-3 px-3 lg:px-0 lg:py-[11px]">
            <Link to="/" className="hidden lg:block" aria-label="Back to Forms">
              <img
                src="/Logo_Black.svg"
                alt="Logo"
                className="block dark:hidden h-12.5 w-auto mx-auto"
              />
              <img
                src="/Logo_White.svg"
                className="dark:block hidden h-12.5 w-auto  mx-auto"
                alt="Logo"
              />
            </Link>
            <Link to="/" className="lg:hidden block" aria-label="Back to Forms">
              <img
                src="/short-logo.png"
                alt="Logo"
                className="block dark:hidden h-7.5 w-auto mx-auto"
              />
              <img
                src="/short-logo-white.png"
                className="dark:block hidden h-7.5 w-auto  mx-auto"
                alt="Logo"
              />
            </Link>
          </div>

          <div className="flex items-center justify-between w-full px-5 lg:px-8">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-auto"
            >
              <TabsList className="h-10">
                <TabsTrigger value="design" className="px-4">
                  Design
                </TabsTrigger>
                <TabsTrigger value="preview" className="px-4">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="theme" className="px-4">
                  Themes
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex justify-end items-center gap-4">
              <ModeToggle />
              <Button
                type="button"
                variant="outline"
                className="h-10 w-10"
                onClick={() => creator?.undo()}
                disabled={!canUndo}
                title="Undo"
              >
                <Undo2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h- w-10"
                onClick={() => creator?.redo()}
                disabled={!canRedo}
                title="Redo"
              >
                <Redo2 className="size-4" />
              </Button>

              {updated ? (
                <Button
                  type="button"
                  onClick={updateButtonHandler}
                  className="h-10"
                  disabled={UPDATED_FORM.status === "pending"}
                >
                  Update
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={pulishedButtonHanlder}
                  className="h-10"
                  disabled={CREATE_FORM.status === "pending"}
                >
                  Publish
                </Button>
              )}
            </div>
          </div>
        </header>

        <SurveyCreatorComponent creator={creator} />
      </div>
      {shareModal && (
        <FormShareModel data={createdForm} onClose={toggleModel} />
      )}
    </>
  );
};

export default FormSurveyBuilder;
