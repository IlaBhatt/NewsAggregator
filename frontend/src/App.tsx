import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { BrowserRouter } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { OfflineProvider } from "./contexts/OfflineContext";
import { createIDBPersister } from "./utils/queryPersister";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours for offline access
      retry: 1,
      networkMode: "offlineFirst", // Try cache first when offline
    },
  },
});

const persister = createIDBPersister();

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        buster: "", // Change this to invalidate all cached queries
      }}
    >
      <OfflineProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-dark-bg">
            <Dashboard />
          </div>
          <ReactQueryDevtools />
        </BrowserRouter>
      </OfflineProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
