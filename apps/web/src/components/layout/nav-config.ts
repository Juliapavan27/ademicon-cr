import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  KanbanSquare,
  MessageCircle,
  CalendarDays,
  Handshake,
  Headset,
  ShieldCheck,
} from "lucide-react";
import type { RoleName } from "@/features/auth/domain/user";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: RoleName[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: KanbanSquare },
  { href: "/conversas", label: "Conversas", icon: MessageCircle },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/parceiros", label: "Parceiros", icon: Handshake, roles: ["admin", "gestor", "parceiro"] },
  { href: "/secretaria", label: "Secretária", icon: Headset, roles: ["admin", "gestor", "secretaria"] },
  { href: "/admin/usuarios", label: "Administração", icon: ShieldCheck, roles: ["admin"] },
];

export function visibleNavItems(userRoles: RoleName[]): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.some((role) => userRoles.includes(role)));
}
