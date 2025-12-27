import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GEOBase | עריכת מאמר",
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}






