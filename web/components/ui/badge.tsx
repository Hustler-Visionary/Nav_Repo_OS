import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide backdrop-blur-sm",
  {
    variants: {
      tone: {
        cyan: "border-hud-cyanDim/50 bg-hud-cyan/10 text-hud-cyan",
        magenta: "border-hud-magentaDim/50 bg-hud-magenta/10 text-hud-magenta",
        green: "border-hud-green/30 bg-hud-green/10 text-hud-green",
        amber: "border-hud-amber/30 bg-hud-amber/10 text-hud-amber",
        red: "border-hud-red/30 bg-hud-red/10 text-hud-red",
        neutral: "border-white/10 bg-white/5 text-hud-textDim"
      }
    },
    defaultVariants: { tone: "neutral" }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, tone, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
);
