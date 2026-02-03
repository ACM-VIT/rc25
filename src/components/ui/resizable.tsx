"use client";

import { GripVertical } from "lucide-react";
import {
  Group as ResizableGroup,
  Panel as ResizablePanelPrimitive,
  Separator as ResizableSeparator,
} from "react-resizable-panels";

import { cn } from "@/utils/class-merge";

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizableGroup>) => (
  <ResizableGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col overflow-hidden",
      className
    )}
    {...props}
  />
);

const ResizablePanel = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePanelPrimitive>) => (
  <ResizablePanelPrimitive
    className={cn("overflow-hidden", className)}
    {...props}
  />
);

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizableSeparator> & {
  withHandle?: boolean;
}) => (
  <ResizableSeparator
    className={cn(
      "relative flex items-center justify-center bg-transparent transition-colors shrink-0",
      "w-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:h-1",
      "cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize",
      
      "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0", // Remove all focus styles
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border data-[panel-group-direction=vertical]:rotate-90">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizableSeparator>
);


export { ResizablePanelGroup, ResizablePanel, ResizableHandle };