import { Sidebar } from "@/components/sidebar/Sidebar";
import { ToggleSidebarProvider } from "@/context/ToggleSidebar";
import { UserActivityStatusProvider } from "@/context/UserActivityStatus";
import { UserEditableWorkspacesProvider } from "@/context/UserEditableWorkspaces";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import dynamic from "next/dynamic";

// Import the chatbot with dynamic import to prevent SSR issues
const ClaudeAIAssistant = dynamic(() => import("@/components/chatbot/AIChatbot").then(mod => mod.AIChatbot), {
  ssr: false,
});

const WorkInProgressLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserActivityStatusProvider>
      <UserEditableWorkspacesProvider>
        <ToggleSidebarProvider>
          <div className="flex flex-col h-0 min-h-screen w-full overflow-hidden">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="relative p-4 md:p-6 lg:px-10 flex-grow flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-background">
                {children}
                <ClaudeAIAssistant />
              </div>
            </div>
          </div>
        </ToggleSidebarProvider>
      </UserEditableWorkspacesProvider>
    </UserActivityStatusProvider>
  );
};

export default WorkInProgressLayout; 