import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout userName="Employee" userRole="Employee">
      {children}
    </DashboardLayout>
  );
}
