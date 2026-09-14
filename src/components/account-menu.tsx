import { LayoutDashboard, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function AccountMenu({
  name,
  image,
  username,
}: {
  name: string | null | undefined;
  image: string | null | undefined;
  username?: string | null | undefined;
}) {
  const t = await getTranslations("Header");
  const initial = name?.[0] ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={t("accountMenu")}
            className="cursor-pointer rounded-full"
          />
        }
      >
        <Avatar>
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-10">
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            {username ? (
              <span className="truncate text-xs text-muted-foreground">@{username}</span>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />} className="cursor-pointer">
          <LayoutDashboard className="size-4" strokeWidth={1.5} />
          {t("dashboardAria")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
          className="contents"
        >
          <DropdownMenuItem
            render={<button type="submit" className="w-full" />}
            variant="destructive"
            className="cursor-pointer"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            {t("signOut")}
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
