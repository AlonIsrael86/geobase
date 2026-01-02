import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GEOBase | לוח בקרה",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}











