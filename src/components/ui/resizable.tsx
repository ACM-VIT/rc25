"use client";

import { GripVertical } from "lucide-react";
import {
  PanelGroup as ResizableGroup,
  Panel as ResizablePanelPrimitive,
  PanelResizeHandle as ResizableSeparator,
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
       "relative flex w-px items-center justify-center bg-transparent after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:bg-transparent outline-none focus:outline-none focus-visible:outline-none data-[resize-handle-active]:outline-none data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 shrink-0",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border pointer-events-none select-none">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizableSeparator>
);


export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
