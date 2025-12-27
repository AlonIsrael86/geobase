"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/lib/storage";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ArticleListProps {
  articles: Article[];
}

type ArticleStatus = "draft" | "editing" | "published";

const statusConfig: Record<ArticleStatus, { label: string; class: string }> = {
  draft: { label: "טיוטה", class: "status-draft" },
  editing: { label: "טיוטה", class: "status-editing" },
  published: { label: "פורסם", class: "status-published" },
};

export function ArticleList({ articles }: ArticleListProps) {
  // Get last 5 articles
  const recentArticles = articles.slice(0, 5);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        {/* Title on RIGHT in RTL, icon comes after text */}
        <CardTitle className="text-lg flex items-center gap-2">
          מאמרים אחרונים
          <FileText className="w-5 h-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recentArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>לא נוצרו מאמרים עדיין</p>
            <p className="text-sm mt-1">בחר שאלות מהטבלה למעלה וצור מאמר</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {recentArticles.map((article) => {
              const status = statusConfig[article.status];
              const questionCount = article.submissionIds.length;

              return (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* Arrow on LEFT in RTL (comes first in flex) */}
                  <div className="flex items-center gap-3">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Badge className={cn("text-xs border", status.class)}>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Content on RIGHT in RTL */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center justify-end gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="ltr-nums">
                        {format(new Date(article.updatedAt), "dd/MM/yyyy")}
                      </span>
                      <span>•</span>
                      <span className="ltr-nums">{questionCount} שאלות</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
