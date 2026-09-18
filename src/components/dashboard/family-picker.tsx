"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type PickableFamily = { id: string; name: string; icon: string | null };

export function FamilyPicker({ families }: { families: PickableFamily[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex w-full flex-col gap-2.5">
      {families.map((family, index) => (
        <motion.div
          key={family.id}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="overflow-hidden border-border/60 p-0 transition-colors hover:border-primary/40 hover:bg-accent/40">
            <Link
              href={`/dashboard/${family.id}`}
              className="group flex items-center gap-3 px-5 py-4 text-left transition-transform active:scale-[0.99]"
            >
              <Avatar size="lg" className="shrink-0">
                {family.icon && (
                  <AvatarImage
                    src={`https://cdn.discordapp.com/icons/${family.id}/${family.icon}.png?size=128`}
                    alt=""
                  />
                )}
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {family.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">{family.name}</span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
