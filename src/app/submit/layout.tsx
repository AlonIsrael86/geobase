import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GEOBase | הוספת שאלה",
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}






