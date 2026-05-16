import { Gauge, type LucideIcon, MessagesSquare, MapPin, Users, Package } from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "VisActor Next Template",
  description: "Template for VisActor and Next.js",
};

export const navigations: Navigation[] = [
  {
    icon: Gauge,
    name: "Dashboard",
    href: "/",
  },
  {
    icon: MessagesSquare,
    name: "Ticket",
    href: "/ticket",
  },
  {
    icon: MapPin,
    name: "Cidades",
    href: "/cidade",
  },
  {
    icon: Users,
    name: "Clientes",
    href: "/cliente",
  },
  {
    icon: Package,
    name: "Produtos",
    href: "/produto",
  },
];
