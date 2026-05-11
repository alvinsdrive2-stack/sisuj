import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function HrManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout userName="Admin HR" userRole="HR Manager">
      {children}
    </DashboardLayout>
  );
}
