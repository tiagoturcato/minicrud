import Container from "@/components/container";
import { MapPin, Users, Package, TrendingUp } from "lucide-react";

export default function DashboardStats({ stats }: { stats: any }) {
  const items = [
    {
      title: "Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Produtos",
      value: stats.totalProdutos,
      icon: Package,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Vendido",
      value: stats.totalVendido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Ticket Médio",
      value: stats.ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <Container className="grid grid-cols-1 gap-4 py-6 phone:grid-cols-2 laptop:grid-cols-4 border-b border-border">
      {items.map((item) => (
        <div key={item.title} className="flex items-center gap-4 rounded-xl border border-border p-4 bg-card shadow-sm">
          <div className={`rounded-lg p-3 ${item.bg}`}>
            <item.icon className={`h-6 w-6 ${item.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
            <h3 className="text-2xl font-bold">{item.value}</h3>
          </div>
        </div>
      ))}
    </Container>
  );
}
