import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Routes from "./pages/routes";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
const queryClient = new QueryClient();
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Routes />
        <ToastContainer theme="colored" />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
