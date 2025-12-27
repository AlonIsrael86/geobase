"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
// Categories now use database via API
import { Plus, Trash2, X, Tag } from "lucide-react";

interface CategoryManagementModalProps {
  open: boolean;
  onClose: () => void;
  onCategoriesChange?: () => void;
}

export function CategoryManagementModal({
  open,
  onClose,
  onCategoriesChange,
}: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      if (open) {
        try {
          const response = await fetch("/api/categories?namesOnly=true");
          if (response.ok) {
            const categoryNames = await response.json();
            setCategories(categoryNames);
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        }
        setNewCategory("");
        setError("");
      }
    };
    loadCategories();
  }, [open]);

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setError("יש להזין שם קטגוריה");
      return;
    }
    if (categories.includes(trimmed)) {
      setError("קטגוריה זו כבר קיימת");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (response.ok) {
        // Reload categories
        const categoriesResponse = await fetch("/api/categories?namesOnly=true");
        if (categoriesResponse.ok) {
          const categoryNames = await categoriesResponse.json();
          setCategories(categoryNames);
        }
        setNewCategory("");
        setError("");
        onCategoriesChange?.();
      } else {
        const data = await response.json();
        setError(data.error || "שגיאה בהוספת הקטגוריה");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setError("שגיאה בהוספת הקטגוריה");
    }
  };

  const handleDeleteCategory = (name: string) => {
    setCategoryToDelete(name);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        const response = await fetch(`/api/categories?name=${encodeURIComponent(categoryToDelete)}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Reload categories
            const categoriesResponse = await fetch("/api/categories?namesOnly=true");
            if (categoriesResponse.ok) {
              const categoryNames = await categoriesResponse.json();
              setCategories(categoryNames);
            }
            onCategoriesChange?.();
          }
        }
        setCategoryToDelete(null);
      } catch (error) {
        console.error("Error deleting category:", error);
        setCategoryToDelete(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
<DialogContent className="w-full max-w-[calc(100vw-24px)] h-[calc(100vh-24px)] sm:h-auto sm:max-w-md sm:rounded-2xl [&>button]:hidden" dir="rtl">
{/* Custom Header with close button on LEFT (RTL) */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogHeader className="flex-1 text-right">
            <DialogTitle className="flex items-center justify-end gap-2">
              ניהול קטגוריות
              <Tag className="h-5 w-5 text-primary" />
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Categories List */}
        <ScrollArea className="h-64 rounded-lg border border-border p-2">
          {categories.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="hebrew-text">אין קטגוריות</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <span className="font-medium hebrew-text">{category}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Add New Category */}
        <div className="space-y-2 mt-4">
          <div className="flex gap-2">
            <Button
              onClick={handleAddCategory}
              className="btn-primary gap-2"
              disabled={!newCategory.trim()}
            >
              <Plus className="h-4 w-4" />
              הוסף
            </Button>
            <Input
              placeholder="שם קטגוריה חדשה"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 text-right"
              dir="auto"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive text-right hebrew-text">
              {error}
            </p>
          )}
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent dir="rtl" className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">מחיקת קטגוריה</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              האם אתה בטוח שברצונך למחוק את הקטגוריה "{categoryToDelete}"?
              פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

