"use client";

import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { Legend as RechartsLegend, Tooltip as RechartsTooltip } from "recharts";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "@/utils/class-merge";

const chartVariants = tv({
  base: "recharts-wrapper",
  variants: {
    size: {
      sm: "h-[200px] w-full",
      md: "h-[300px] w-full",
      lg: "h-[400px] w-full",
      xl: "h-[500px] w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    icon?: React.ElementType;
  };
}

interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  config: ChartConfig;
}

const Chart = forwardRef<ElementRef<"div">, ChartProps>(
  ({ config, className, size, ...props }, ref) => {
    const cssProperties = Object.entries(config).reduce((acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color;
      }
      return acc;
    }, {} as Record<string, string>);

    return (
      <div
        ref={ref}
        className={cn(chartVariants({ size }), className)}
        style={cssProperties}
        {...props}
      />
    );
  }
);
Chart.displayName = "Chart";

const ChartTooltip = forwardRef<
  ElementRef<typeof RechartsTooltip>,
  ComponentPropsWithoutRef<typeof RechartsTooltip>
>(({ content, ...props }, ref) => {
  return (
    <RechartsTooltip
      ref={ref}
      content={
        content ?? (
          <div className="rounded-lg border bg-background p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-foreground" />
                <span className="text-sm text-muted-foreground">Value</span>
              </div>
              <div className="text-right text-sm font-medium">100</div>
            </div>
          </div>
        )
      }
      {...props}
    />
  );
});
ChartTooltip.displayName = "ChartTooltip";

// Instead of using forwardRef (which causes a type conflict), we define ChartLegend as a simple functional component.
const ChartLegend = (props: ComponentPropsWithoutRef<typeof RechartsLegend>) => {
  return <RechartsLegend {...props} />;
};
ChartLegend.displayName = "ChartLegend";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  labelKey?: string;
  valueKey?: string;
  hideLabel?: boolean;
  hideValue?: boolean;
  indicator?: "line" | "dot";
}

const ChartTooltipContent = ({
  active,
  payload = [],
  label,
  labelKey,
  valueKey,
  hideLabel,
  hideValue,
  indicator = "dot",
}: ChartTooltipContentProps) => {
  if (!active || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && (
        <div className="mb-1 text-sm font-medium text-muted-foreground">
          {labelKey ? label : payload[0]?.name}
        </div>
      )}
      <div className="grid gap-0.5">
        {payload.map((item, i) => (
          <div key={`item-${i}`} className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              {indicator === "dot" ? (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              ) : (
                <div
                  className="h-0.5 w-2"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="text-sm text-muted-foreground">
                {item.name}
              </span>
            </div>
            {!hideValue && (
              <div className="text-right text-sm font-medium">
                {valueKey ? item.value : item.value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  Chart as ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartTooltipContent,
};
