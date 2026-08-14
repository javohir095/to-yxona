import { NavLink } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { NAV_GROUPS } from "./nav-config";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function SidebarContent() {
  const { profile } = useAuth();
  const role = profile?.role;

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !role || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile?.venue?.name || "To'yxona"}</p>
          <p className="truncate text-xs text-muted-foreground">Boshqaruv tizimi</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-sidebar-foreground hover:bg-muted",
                    )
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <UserMenu />
      </div>
    </div>
  );
}
