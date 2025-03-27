import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ModernCardProps {
  title?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  children: React.ReactNode;
  variant?: "default" | "purple" | "accent";
}

export function ModernCard({
  title,
  className,
  contentClassName,
  headerClassName,
  children,
  variant = "default",
}: ModernCardProps) {
  const variantStyles = {
    default: "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
    purple: "bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-950/40 dark:to-indigo-950/40",
    accent: "bg-gradient-to-br from-purple-100/90 via-violet-50/90 to-indigo-100/90 dark:from-purple-900/40 dark:via-violet-900/40 dark:to-indigo-900/40",
  };

  return (
    <Card
      className={cn(
        "border border-purple-200/50 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden",
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <CardHeader className={cn("pb-2", headerClassName)}>
          <CardTitle className="text-lg font-medium text-purple-900 dark:text-purple-200">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("p-4 md:p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
