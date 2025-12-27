"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Inbox, FileEdit, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  newSubmissions: number;
  articlesInProgress: number;
  publishedArticles: number;
}

export function StatsCards({
  newSubmissions,
  articlesInProgress,
  publishedArticles,
}: StatsCardsProps) {
  const stats = [
    {
      title: "ממתינות לטיפול",
      value: newSubmissions,
      icon: Inbox,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "בעריכה",
      value: articlesInProgress,
      icon: FileEdit,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "פורסמו",
      value: publishedArticles,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="card-hover border-border/50"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-start justify-center gap-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold ltr-nums leading-none text-center w-full">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

