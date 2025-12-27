import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function SimilarQuestions() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          שאלות דומות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          טוען שאלות דומות...
        </div>
      </CardContent>
    </Card>
  );
}

