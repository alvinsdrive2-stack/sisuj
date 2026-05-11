import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function HrStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout userName="HR Staff" userRole="HR Staff">
      {children}
    </DashboardLayout>
  );
}
