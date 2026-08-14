import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  note = "Bu bo'lim keyingi bosqichlarda ishlab chiqiladi.",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1"
    >
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Icon className="size-6" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{note}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
