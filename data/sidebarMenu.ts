import {
  Home,
  Users,
  ShoppingCart,
  Truck,
  Box,
  Settings,
  DollarSign,
  Cpu,
  Shield,
  Globe,
  FileText,
  Image,
  Edit,
  Layers,
  Clock,
  TrendingUp,
  GraduationCap,
  Wallet,
  CalendarDays,
  UserCheck,
  Receipt,
  Filter,
  MessageSquare,
  Tag,
  Bell,
  BarChart3,
  FileSpreadsheet,
  CreditCard,
  Target,
  PiggyBank,
  Coins,
  Wrench,
  ClipboardCheck,
  Package,
  QrCode,
  History,
  Factory,
  CheckCircle,
  // Tool,
  Users2,
  Hash,
  Trash2,
  BookOpen,
  LayoutDashboard,
  FileCheck,
  AlertTriangle,
  Menu,
  Search,
  Send,
  Palette,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  path?: string;
  icon: React.ComponentType<any>;
  subMenu?: SidebarItem[];
}

export const sidebarMenu: SidebarItem[] = [
  {
    title: "Dasbor",
    icon: Home,
    subMenu: [
      { title: "Ringkasan", path: "/dashboard", icon: LayoutDashboard },
      { title: "Analitik", path: "/dashboard/analytics", icon: BarChart3 },
      {
        title: "Kinerja Penjualan",
        path: "/dashboard/sales",
        icon: TrendingUp,
      },
      {
        title: "Status Inventori",
        path: "/dashboard/inventory",
        icon: Package,
      },
      {
        title: "Ringkasan Keuangan",
        path: "/dashboard/finance",
        icon: DollarSign,
      },
      {
        title: "Metrik Produksi",
        path: "/dashboard/production",
        icon: Factory,
      },
      { title: "Ringkasan SDM", path: "/dashboard/hr", icon: Users },
      {
        title: "Pemantauan Real-time",
        path: "/dashboard/realtime",
        icon: Clock,
      },
    ],
  },
  {
    title: "User & Karyawan",
    icon: Users,
    subMenu: [
      { title: "Manajemen User", path: "/user", icon: UserCheck },
      { title: "Manajemen Karyawan", path: "/karyawan", icon: Users },
      { title: "Absensi & Shift", path: "/karyawan/absensi", icon: Clock },
      { title: "Kinerja & KPI", path: "/karyawan/kpi", icon: TrendingUp },
      {
        title: "Pelatihan & Sertifikasi",
        path: "/karyawan/training",
        icon: GraduationCap,
      },
      {
        title: "Payroll & Slip Gaji",
        path: "/karyawan/payroll",
        icon: Wallet,
      },
      { title: "Manajemen Cuti", path: "/karyawan/leave", icon: CalendarDays },
    ],
  },
  {
    title: "Customer & Penjualan",
    icon: ShoppingCart,
    subMenu: [
      { title: "Manajemen Customer", path: "/customer", icon: Users },
      { title: "Pencatatan Penjualan", path: "/penjualan", icon: Receipt },
      { title: "Order & Penawaran", path: "/sales/order", icon: FileText },
      {
        title: "CRM & Interaksi Customer",
        path: "/sales/crm",
        icon: MessageSquare,
      },
      {
        title: "Harga Dinamis & Diskon",
        path: "/sales/discount",
        icon: Tag,
      },
      {
        title: "Invoice & Pengingat Pembayaran",
        path: "/sales/invoice",
        icon: Bell,
      },
      {
        title: "Pipeline / Funnel Penjualan",
        path: "/sales/funnel",
        icon: Filter,
      },
    ],
  },
  {
    title: "Supplier & Pengadaan",
    icon: Truck,
    subMenu: [
      { title: "Manajemen Supplier", path: "/supplier", icon: Truck },
      { title: "Pencatatan Pembelian", path: "/pembelian", icon: ShoppingCart },
      {
        title: "Permintaan & Persetujuan Pembelian",
        path: "/procurement/request",
        icon: FileCheck,
      },
      {
        title: "Rating & Kinerja Vendor",
        path: "/procurement/vendor-rating",
        icon: BarChart3,
      },
      {
        title: "Manajemen Kontrak & Ketentuan",
        path: "/procurement/contract",
        icon: FileText,
      },
    ],
  },
  {
    title: "Produk & Inventori",
    icon: Box,
    subMenu: [
      { title: "Manajemen Produk", path: "/produk", icon: Package },
      { title: "Manajemen Inventori", path: "/inventory", icon: Box },
      {
        title: "Manajemen Multi-Gudang",
        path: "/inventory/warehouse",
        icon: Home,
      },
      // { title: "Scanner Barcode / QR", path: "/inventory/scanner", icon: QrCode },
      {
        title: "Peramalan Inventori",
        path: "/inventory/forecast",
        icon: TrendingUp,
      },
      {
        title: "Riwayat Pergerakan Inventori",
        path: "/inventory/history",
        icon: History,
      },
    ],
  },
  {
    title: "Produksi & Operasional",
    icon: Factory,
    subMenu: [
      { title: "Manajemen Produksi", path: "/produksi", icon: Factory },
      { title: "Kontrol Kualitas", path: "/produksi/qc", icon: CheckCircle },
      {
        title: "Pemeliharaan Mesin & Peralatan",
        path: "/produksi/maintenance",
        icon: Wrench,
      },
      {
        title: "Manajemen Shift & Operator",
        path: "/produksi/shift",
        icon: Users2,
      },
      {
        title: "Pelacakan Batch & Nomor Seri",
        path: "/produksi/batch",
        icon: Hash,
      },
      {
        title: "Manajemen Limbah & Scrap",
        path: "/produksi/waste",
        icon: Trash2,
      },
      { title: "SOP & Keselamatan", path: "/produksi/sop", icon: BookOpen },
    ],
  },
  {
    title: "Keuangan & Akuntansi",
    icon: DollarSign,
    subMenu: [
      { title: "Dasbor Keuangan", path: "/finance", icon: LayoutDashboard },
      {
        title: "Laporan & Ekspor",
        path: "/finance/laporan",
        icon: FileSpreadsheet,
      },
      {
        title: "Piutang / Hutang",
        path: "/finance/ar-ap",
        icon: CreditCard,
      },
      {
        title: "Anggaran & Kontrol Biaya",
        path: "/finance/budget",
        icon: PiggyBank,
      },
      {
        title: "Pelacakan & Persetujuan Pengeluaran",
        path: "/finance/expense",
        icon: Receipt,
      },
      {
        title: "Multi-Mata Uang / Multi-Akun",
        path: "/finance/currency",
        icon: Coins,
      },
    ],
  },
  {
    title: "AI / LLM & RAG",
    icon: Cpu,
    subMenu: [
      { title: "Query & Wawasan", path: "/ai/query", icon: Search },
      { title: "Prediksi & Rekomendasi", path: "/ai/prediksi", icon: Target },
      {
        title: "Pembuatan Laporan Otomatis",
        path: "/ai/reports",
        icon: FileText,
      },
      {
        title: "Dukungan Keputusan / Rekomendasi",
        path: "/ai/decision",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Kepatuhan & Keselamatan",
    icon: Shield,
    subMenu: [
      { title: "Manajemen Dokumen", path: "/compliance/docs", icon: FileText },
      { title: "Jejak Audit", path: "/compliance/audit", icon: History },
      {
        title: "Pelaporan Keselamatan & Insiden",
        path: "/compliance/safety",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "CMS Website",
    icon: Globe,
    subMenu: [
      { title: "Halaman", path: "/cms/pages", icon: FileText },
      { title: "Blog", path: "/cms/blog", icon: Edit },
      { title: "Perpustakaan Media", path: "/cms/media", icon: Image },
      { title: "Navigasi & Menu", path: "/cms/menus", icon: Menu },
      { title: "SEO & Meta", path: "/cms/seo", icon: Search },
      { title: "Formulir & Kiriman", path: "/cms/forms", icon: Send },
      { title: "Tema & Template", path: "/cms/themes", icon: Palette },
    ],
  },
  {
    title: "Pengaturan",
    icon: Settings,
    path: "/settings",
  },
];
