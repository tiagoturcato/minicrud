const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const produtos = [
    { nome: "Notebook Dell Inspiron 15", sku: "NOTE-DELL-001", preco_venda: 3299.99, custo: 2400.00, ativo: 1 },
    { nome: "Mouse Logitech MX Master 3", sku: "MOUS-LOGI-001", preco_venda: 449.90, custo: 280.00, ativo: 1 },
    { nome: "Teclado Mecânico Redragon K552", sku: "TECL-REDR-001", preco_venda: 259.90, custo: 160.00, ativo: 1 },
    { nome: "Monitor LG 24\" Full HD IPS", sku: "MONI-LG-001", preco_venda: 1199.00, custo: 800.00, ativo: 1 },
    { nome: "SSD Kingston 480GB SATA", sku: "SSD-KING-001", preco_venda: 249.90, custo: 160.00, ativo: 1 },
    { nome: "Memória RAM Kingston 16GB DDR4", sku: "RAM-KING-001", preco_venda: 299.90, custo: 190.00, ativo: 1 },
    { nome: "Processador Intel Core i5-12400F", sku: "CPU-INTL-001", preco_venda: 899.00, custo: 620.00, ativo: 1 },
    { nome: "Placa de Vídeo RTX 3060 12GB", sku: "GPU-NVI-001", preco_venda: 2199.00, custo: 1600.00, ativo: 1 },
    { nome: "Fonte Corsair 650W 80 Plus Bronze", sku: "FONT-CORS-001", preco_venda: 399.90, custo: 250.00, ativo: 1 },
    { nome: "Gabinete NZXT H510 Mid-Tower", sku: "GABI-NZXT-001", preco_venda: 699.00, custo: 450.00, ativo: 1 },
    { nome: "Headset HyperX Cloud II", sku: "HEAD-HPXY-001", preco_venda: 549.90, custo: 350.00, ativo: 1 },
    { nome: "Webcam Logitech C920 Full HD", sku: "WEBC-LOGI-001", preco_venda: 479.90, custo: 300.00, ativo: 1 },
    { nome: "Roteador TP-Link AX3000 Wi-Fi 6", sku: "ROTE-TPLI-001", preco_venda: 599.00, custo: 380.00, ativo: 1 },
    { nome: "Hub USB-C 7 em 1 Multilaser", sku: "HUB-MULT-001", preco_venda: 189.90, custo: 100.00, ativo: 1 },
    { nome: "Pen Drive SanDisk 64GB USB 3.2", sku: "PEN-SAND-001", preco_venda: 59.90, custo: 30.00, ativo: 1 },
  ];

  await prisma.produto.createMany({ data: produtos });
  console.log(`✅ ${produtos.length} produtos de informática cadastrados com sucesso!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
