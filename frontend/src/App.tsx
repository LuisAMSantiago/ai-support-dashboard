import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import TicketList from "@/pages/TicketList";
import TicketDetail from "@/pages/TicketDetail";
import TrashedTickets from "@/pages/TrashedTickets";
import TicketSummary from "@/pages/TicketSummary";
import TicketBacklog from "@/pages/TicketBacklog";
import TicketActivity from "@/pages/TicketActivity";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/tickets" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/trashed"
            element={
              <ProtectedRoute>
                <TrashedTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/summary"
            element={
              <ProtectedRoute>
                <TicketSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/backlog"
            element={
              <ProtectedRoute>
                <TicketBacklog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/activity"
            element={
              <ProtectedRoute>
                <TicketActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
