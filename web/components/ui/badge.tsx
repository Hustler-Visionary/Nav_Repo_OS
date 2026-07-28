import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
  {
    variants: {
      tone: {
        cyan: "border-hud-cyanDim/60 bg-hud-cyan/10 text-hud-cyan",
        magenta: "border-hud-magentaDim/60 bg-hud-magenta/10 text-hud-magenta",
        green: "border-hud-green/40 bg-hud-green/10 text-hud-green",
        amber: "border-hud-amber/40 bg-hud-amber/10 text-hud-amber",
        red: "border-hud-red/40 bg-hud-red/10 text-hud-red",
        neutral: "border-hud-border bg-hud-panelAlt text-hud-textDim"
      }
    },
    defaultVariants: { tone: "neutral" }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, tone, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
);
