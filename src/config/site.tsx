import { Gauge, type LucideIcon, MessagesSquare, MapPin, Users, Package, ShoppingCart, Tags, Monitor, BarChart2 } from "lucide-react";

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
    icon: BarChart2,
    name: "BI Dashboard",
    href: "/bi",
  },
  {
    icon: Monitor,
    name: "PDV – Caixa",
    href: "/pdv",
  },
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
  {
    icon: ShoppingCart,
    name: "Vendas",
    href: "/venda",
  },
  {
    icon: Tags,
    name: "Itens da Venda",
    href: "/produto_venda",
  },
];
