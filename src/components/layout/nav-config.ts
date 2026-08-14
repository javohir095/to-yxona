import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Wallet,
  AlertTriangle,
  BarChart3,
  UtensilsCrossed,
  ClipboardList,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/entities";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const ALL_ROLES: UserRole[] = ["owner", "manager", "kitchen_staff"];
export const MANAGEMENT_ROLES: UserRole[] = ["owner", "manager"];
export const OWNER_ONLY: UserRole[] = ["owner"];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "ASOSIY",
    items: [
      { to: "/", label: "Panel", icon: LayoutDashboard, roles: ALL_ROLES },
      { to: "/bookings", label: "Bandliklar", icon: CalendarDays, roles: ALL_ROLES },
      { to: "/halls", label: "Zallar", icon: DoorOpen, roles: ALL_ROLES },
    ],
  },
  {
    label: "MOLIYA",
    items: [
      { to: "/payments", label: "To'lovlar", icon: Wallet, roles: MANAGEMENT_ROLES },
      { to: "/debts", label: "Qarzlar", icon: AlertTriangle, roles: MANAGEMENT_ROLES },
      { to: "/reports", label: "Hisobotlar", icon: BarChart3, roles: MANAGEMENT_ROLES },
    ],
  },
  {
    label: "OSHXONA",
    items: [
      { to: "/menus", label: "Menyular", icon: UtensilsCrossed, roles: ALL_ROLES },
      { to: "/requisitions", label: "Talabnoma", icon: ClipboardList, roles: ALL_ROLES },
      { to: "/inventory", label: "Ombor", icon: Package, roles: ALL_ROLES },
    ],
  },
  {
    label: "TIZIM",
    items: [{ to: "/staff", label: "Xodimlar", icon: Users, roles: OWNER_ONLY }],
  },
];
