"use client";

import { AIChatbot } from "@/components/chatbot/AIChatbot";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AIChatbot />
    </>
  );
}
