"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Tag } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Input } from "@/components/ui/input";
import { resolveSelectionId } from "@/lib/categorySelection";

interface Category {
  _id: Id<"categories">;
  name: string;
  parent_id?: Id<"categories">;
  level?: number;
}

interface HierarchicalCategorySelectorProps {
  value?: Id<"categories">;
  onChange: (categoryId: Id<"categories">) => void;
  label?: string;
  required?: boolean;
}

export default function HierarchicalCategorySelector({
  value,
  onChange,
  label = "Category",
  required = false,
}: HierarchicalCategorySelectorProps) {
  const { success, error } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | "">(
    value || "",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    Id<"categories"> | ""
  >("");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<
    Id<"categories"> | ""
  >("");

  // Show add new category form
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [showAddSubSubCategory, setShowAddSubSubCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newSubSubCategoryName, setNewSubSubCategoryName] = useState("");

  const createCategory = useMutation(api.categories.createCategory);

  // Get root categories (main categories)
  const rootCategories = useQuery(
    api.categories.getRootCategories,
    { is_active: true },
  ) as Category[] | null | undefined;

  // Get sub-categories when a category is selected
  const subCategories = useQuery(
    api.categories.getSubcategories,
    selectedCategory
      ? { parent_id: selectedCategory as Id<"categories">, is_active: true }
      : "skip",
  ) as Category[] | null | undefined;

  // Get sub-sub-categories when a sub-category is selected
  const subSubCategories = useQuery(
    api.categories.getSubcategories,
    selectedSubCategory
      ? { parent_id: selectedSubCategory as Id<"categories">, is_active: true }
      : "skip",
  ) as Category[] | null | undefined;

  // Get all categories with levels to find the selected category's hierarchy
  const allCategories = useQuery(
    api.categories.getCategoriesWithLevel,
    { is_active: true },
  ) as (Category & { level: number })[] | null | undefined;

  // Initialize selected values from the current value
  useEffect(() => {
    if (value && allCategories) {
      const category = allCategories.find((cat) => cat._id === value);
      if (category) {
        if (category.level === 0) {
          // Root category
          setSelectedCategory(value);
          setSelectedSubCategory("");
          setSelectedSubSubCategory("");
        } else if (category.level === 1) {
          // Sub-category
          setSelectedCategory(category.parent_id!);
          setSelectedSubCategory(value);
          setSelectedSubSubCategory("");
        } else if (category.level === 2) {
          // Sub-sub-category
          const subCat = allCategories.find(
            (cat) => cat._id === category.parent_id,
          );
          if (subCat) {
            setSelectedCategory(subCat.parent_id!);
            setSelectedSubCategory(subCat._id);
            setSelectedSubSubCategory(value);
          }
        }
      }
    }
  }, [value, allCategories]);

  // Update parent when selection changes
  useEffect(() => {
    const resolved = resolveSelectionId(
      selectedCategory,
      selectedSubCategory,
      selectedSubSubCategory,
    );
    if (resolved && resolved !== value) {
      onChange(resolved as Id<"categories">);
    }
  }, [selectedCategory, selectedSubCategory, selectedSubSubCategory, value, onChange]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      error("Please enter a category name");
      return;
    }

    try {
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        sort_order: (rootCategories?.length || 0) * 10,
      });
      success("Category created successfully!");
      setNewCategoryName("");
      setShowAddCategory(false);
      setSelectedCategory(categoryId);
    } catch (err) {
      error("Failed to create category");
      console.error(err);
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
      error("Please enter a sub-category name");
      return;
    }
    if (!selectedCategory) {
      error("Please select a category first");
      return;
    }

    try {
      const subCategoryId = await createCategory({
        name: newSubCategoryName.trim(),
        parent_id: selectedCategory as Id<"categories">,
        sort_order: (subCategories?.length || 0) * 10,
      });
      success("Sub-category created successfully!");
      setNewSubCategoryName("");
      setShowAddSubCategory(false);
      setSelectedSubCategory(subCategoryId);
    } catch (err) {
      error("Failed to create sub-category");
      console.error(err);
    }
  };

  const handleAddSubSubCategory = async () => {
    if (!newSubSubCategoryName.trim()) {
      error("Please enter a sub-sub-category name");
      return;
    }
    if (!selectedSubCategory) {
      error("Please select a sub-category first");
      return;
    }

    try {
      const subSubCategoryId = await createCategory({
        name: newSubSubCategoryName.trim(),
        parent_id: selectedSubCategory as Id<"categories">,
        sort_order: (subSubCategories?.length || 0) * 10,
      });
      success("Sub-sub-category created successfully!");
      setNewSubSubCategoryName("");
      setShowAddSubSubCategory(false);
      setSelectedSubSubCategory(subSubCategoryId);
    } catch (err) {
      error("Failed to create sub-sub-category");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {/* Main Category */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Main Category</Label>
        <div className="flex gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val as Id<"categories">);
              setSelectedSubCategory("");
              setSelectedSubSubCategory("");
            }}
          >
            <SelectTrigger className="flex-1" aria-label="Main Category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {rootCategories?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAddCategory(!showAddCategory)}
            title="Add new category"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {showAddCategory && (
          <div className="flex gap-2 p-3 border border-border rounded-lg bg-muted/30">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Sub-Category */}
      {selectedCategory && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Sub-Category (Optional)</Label>
          <div className="flex gap-2">
          <Select
            value={selectedSubCategory}
            onValueChange={(val) => {
              if (val === "none") {
                setSelectedSubCategory("");
                setSelectedSubSubCategory("");
              } else {
                setSelectedSubCategory(val as Id<"categories">);
                setSelectedSubSubCategory("");
              }
            }}
          >
              <SelectTrigger className="flex-1" aria-label="Sub-Category">
                <SelectValue placeholder="Select sub-category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {subCategories?.map((subCat) => (
                  <SelectItem key={subCat._id} value={subCat._id}>
                    {subCat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowAddSubCategory(!showAddSubCategory)}
              title="Add new sub-category"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showAddSubCategory && (
            <div className="flex gap-2 p-3 border border-border rounded-lg bg-muted/30">
              <Input
                placeholder="New sub-category name"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSubCategory}
                disabled={!newSubCategoryName.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddSubCategory(false);
                  setNewSubCategoryName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Sub-Category */}
      {selectedSubCategory && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Sub-Sub-Category (Optional)</Label>
          <div className="flex gap-2">
          <Select
            value={selectedSubSubCategory}
            onValueChange={(val) => {
              if (val === "none") {
                setSelectedSubSubCategory("");
              } else {
                setSelectedSubSubCategory(val as Id<"categories">);
              }
            }}
          >
              <SelectTrigger className="flex-1" aria-label="Sub-Sub-Category">
                <SelectValue placeholder="Select sub-sub-category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {subSubCategories?.map((subSubCat) => (
                  <SelectItem key={subSubCat._id} value={subSubCat._id}>
                    {subSubCat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowAddSubSubCategory(!showAddSubSubCategory)}
              title="Add new sub-sub-category"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showAddSubSubCategory && (
            <div className="flex gap-2 p-3 border border-border rounded-lg bg-muted/30">
              <Input
                placeholder="New sub-sub-category name"
                value={newSubSubCategoryName}
                onChange={(e) => setNewSubSubCategoryName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSubSubCategory}
                disabled={!newSubSubCategoryName.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddSubSubCategory(false);
                  setNewSubSubCategoryName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Selected Category Display */}
      {value && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border border-border" aria-live="polite">
          Selected:{" "}
          {(() => {
            if (selectedSubSubCategory && allCategories) {
              const cat = allCategories.find(
                (c) => c._id === selectedSubSubCategory,
              );
              const subCat = allCategories.find(
                (c) => c._id === selectedSubCategory,
              );
              const rootCat = allCategories.find(
                (c) => c._id === selectedCategory,
              );
              return `${rootCat?.name} > ${subCat?.name} > ${cat?.name}`;
            } else if (selectedSubCategory && allCategories) {
              const subCat = allCategories.find(
                (c) => c._id === selectedSubCategory,
              );
              const rootCat = allCategories.find(
                (c) => c._id === selectedCategory,
              );
              return `${rootCat?.name} > ${subCat?.name}`;
            } else if (selectedCategory && allCategories) {
              const rootCat = allCategories.find(
                (c) => c._id === selectedCategory,
              );
              return rootCat?.name;
            }
            return "None";
          })()}
        </div>
      )}
    </div>
  );
}

