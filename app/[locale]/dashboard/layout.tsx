import { Sidebar } from "@/components/sidebar/Sidebar";
import { ToggleSidebarProvider } from "@/context/ToggleSidebar";
import { UserActivityStatusProvider } from "@/context/UserActivityStatus";
import { UserEditableWorkspacesProvider } from "@/context/UserEditableWorkspaces";
import { DashboardHeader } from "@/components/header/DashboardHeader";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserActivityStatusProvider>
      {" "}
      <UserEditableWorkspacesProvider>
        <ToggleSidebarProvider>
          <div className="flex flex-col h-0 min-h-screen w-full overflow-hidden">
            <DashboardHeader />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="relative p-4 md:p-6 lg:px-10 flex-grow flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-background">
                {children}
              </div>
            </div>
          </div>
        </ToggleSidebarProvider>
      </UserEditableWorkspacesProvider>
    </UserActivityStatusProvider>
  );
};

export default DashboardLayout;
