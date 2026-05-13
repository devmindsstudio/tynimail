import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import Home from "./home";
import ForgetPassword from "./forget";
import Login from "./login";
import OTPScreen from "./otp";
import SignUp from "./sign-up";
import NotFound from "./not-found";
import ResetPassword from "./reset-password";
import { PrivateRoute, AuthRoute } from "./protected";
import TyniMailLayout from "@/layout";
import CampaignsPage from "./campaigns";
import CreateCampaings from "./campaigns/create-campaings";

import CampaignsPageUpdate from "./campaigns/update";
import { EmailBuilderMailyTo } from "./builder";
import EmailBuilderMailyToUpdate from "./builder/update";
import AllSubscribersPage from "./subscribers/all-subscibers";
import SegmentPage from "./subscribers/segment";
import SingleSegment from "./subscribers/single-segment";
import SingleSubscriberContact from "./subscribers/single-subscriber-contact";
import EmailValidator from "./email-validator";
import Profile from "./settings/profile";
import Account from "./settings/account";
import Billings from "./settings/billings";
import Integrations from "./settings/integrations";
import AutomationsPage from "./automations";
import WorkflowBuilderPage from "./automations/builder";
import ExecutionsPage from "./automations/executions";
import Pages from "./pages";
import AnalyticsPage from "./pages/analytics-page";
import PageBuilder from "./pages/page-builder";
import PageBuilderUpdate from "./pages/page-builder/update";
import PageTemplates from "./pages/templates";
import PageTemplatesMyPages from "./pages/templates/mypages";
import FormsSurveys from "./forms-surveys";
import FormsAnalyticsPage from "./forms-surveys/analytics-page";
import FormSurveyBuilderUpdate from "./forms-surveys/forms-builder/update";
import FormSurveyBuilder from "./forms-surveys/forms-builder";
// import Dashboard from "./dashboard";
import PagePreview from "./pages/preview";
import ServryPrview from "./forms-surveys/survey-preview";
import FormbricksPage from "./form-bricks";
import UpdatePageBuilderOnly from "./pages/page-builder/update-page";

const router = createBrowserRouter([
  {
    path: "/email-builder",
    element: (
      <PrivateRoute>
        <EmailBuilderMailyTo updated={false} />
        {/* <EmailBuilder updated={false} /> */}
      </PrivateRoute>
    ),
  },
  {
    path: "/email-builder/update-template/:templateId",
    element: (
      <PrivateRoute>
        <EmailBuilderMailyToUpdate />
      </PrivateRoute>
    ),
  },
  {
    path: "/automations/:id/builder",
    element: (
      <PrivateRoute>
        <WorkflowBuilderPage />
      </PrivateRoute>
    ),
  },

  ////PAGES BUILDER
  {
    path: "/page-builder",
    element: (
      <PrivateRoute>
        <PageBuilder updated={false} />
      </PrivateRoute>
    ),
  },
  {
    path: "/page-builder/:pageId",
    element: (
      <PrivateRoute>
        <PageBuilderUpdate />
      </PrivateRoute>
    ),
  },
  {
    path: "/page-update/:pageId",
    element: (
      <PrivateRoute>
        <UpdatePageBuilderOnly />
      </PrivateRoute>
    ),
  },

  /// FORMS BUILDER
  {
    path: "/forms-builder",
    element: (
      <PrivateRoute>
        <FormSurveyBuilder fromSuvryId={null} updated={false} data={null} />
      </PrivateRoute>
    ),
  },
  {
    path: "/forms-builder/:formsbuilderId/update",
    element: (
      <PrivateRoute>
        <FormSurveyBuilderUpdate />
      </PrivateRoute>
    ),
  },

  //// OTHER LAYOUT
  {
    path: "/preview/:id/page",
    element: <PagePreview />,
  },
  {
    path: "/preview/:id/form",
    element: <ServryPrview />,
  },

  {
    path: "/",
    element: (
      <PrivateRoute>
        <TyniMailLayout>
          <Outlet />
        </TyniMailLayout>
      </PrivateRoute>
    ),
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/campaigns",
        children: [
          { path: "", element: <CampaignsPage /> },
          {
            path: "create-campaign",
            element: <CreateCampaings data={null} updated={false} />,
          },
          { path: "create-campaign/:id", element: <CampaignsPageUpdate /> },
        ],
      },
      { path: "/performance", element: <h1>Performance Page</h1> },
      { path: "/email-templates", element: <h1>Email Templates Page</h1> },
      {
        path: "/automations",
        children: [
          { path: "", element: <AutomationsPage /> },
          { path: ":id/executions", element: <ExecutionsPage /> },
        ],
      },
      {
        path: "/pages",
        children: [
          { path: "", element: <Pages /> },
          { path: "templates", element: <PageTemplates /> },
          { path: "templates/my", element: <PageTemplatesMyPages /> },
          { path: ":id/analytics", element: <AnalyticsPage /> },
        ],
      },
      { path: "/reports", element: <h1>Reports Page</h1> },
      { path: "/google-analytics", element: <h1>Google Analytics Page</h1> },
      { path: "/item-1", element: <h1>Item 1 Page</h1> },
      {
        path: "/forms-surveys",
        children: [
          { path: "", element: <FormsSurveys /> },

          { path: ":id/analytics", element: <FormsAnalyticsPage /> },
        ],
      },
      {
        path: "/form-bricks",
        children: [{ path: "", element: <FormbricksPage /> }],
      },
      {
        path: "/subscribers",
        children: [
          { path: "", element: <AllSubscribersPage /> },
          { path: "segments", element: <SegmentPage /> },
          {
            path: "segments/:id/contact",
            element: <SingleSegment />,
          },
        ],
      },
      {
        path: "/settings",
        children: [
          { path: "", element: <Profile /> },
          { path: "account", element: <Account /> },
          { path: "billings", element: <Billings /> },
          { path: "integrations", element: <Integrations /> },
        ],
      },
      { path: "/email-validator", element: <EmailValidator /> },
    ],
  },
  {
    path: "/subscribers/:id/contact",
    element: (
      <PrivateRoute>
        <SingleSubscriberContact />
      </PrivateRoute>
    ),
  },

  // Auth Pages (no layout)
  {
    path: "/",
    element: (
      <AuthRoute>
        <Outlet />
      </AuthRoute>
    ),
    children: [
      { path: "forget-password", element: <ForgetPassword /> },
      { path: "login", element: <Login /> },
      { path: "otp", element: <OTPScreen /> },
      { path: "sign-up", element: <SignUp /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
