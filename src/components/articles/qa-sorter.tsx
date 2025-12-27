"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Submission } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { GripVertical, MessageSquare, Plus } from "lucide-react";

interface QASorterProps {
  submissions: Submission[];
  onReorder: (submissions: Submission[]) => void;
  onAddMore: () => void;
  activeId?: string;
  onSelect: (id: string) => void;
}

function SortableItem({
  submission,
  index,
  isActive,
  onSelect,
}: {
  submission: Submission;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: submission.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const wordCount = submission.answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 cursor-pointer transition-all",
        isDragging && "opacity-50 shadow-lg",
        isActive && "border-primary bg-primary/5"
      )}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{submission.question}</p>
        <p className="text-xs text-muted-foreground ltr-nums">{wordCount} מילים</p>
      </div>
    </div>
  );
}

export function QASorter({
  submissions,
  onReorder,
  onAddMore,
  activeId,
  onSelect,
}: QASorterProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = submissions.findIndex((s) => s.id === active.id);
      const newIndex = submissions.findIndex((s) => s.id === over.id);
      onReorder(arrayMove(submissions, oldIndex, newIndex));
    }
  };

  const totalWords = submissions.reduce(
    (sum, s) => sum + s.answer.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          שאלות במאמר
        </h3>
        <span className="text-sm text-muted-foreground ltr-nums">
          {submissions.length} שאלות • {totalWords} מילים
        </span>
      </div>

      <ScrollArea className="h-[400px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={submissions.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 pr-2">
              {submissions.map((submission, index) => (
                <SortableItem
                  key={submission.id}
                  submission={submission}
                  index={index}
                  isActive={submission.id === activeId}
                  onSelect={() => onSelect(submission.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={onAddMore}
      >
        <Plus className="w-4 h-4" />
        הוסף שאלה
      </Button>
    </div>
  );
}


