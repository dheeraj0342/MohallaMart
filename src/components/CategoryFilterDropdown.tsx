"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
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

interface CategoryWithLevel {
  _id: Id<"categories">;
  name: string;
  parent_id?: Id<"categories">;
  level: number;
}

interface CategoryFilterDropdownProps {
  value?: Id<"categories"> | "all";
  onChange: (categoryId: Id<"categories"> | "all") => void;
  label?: string;
  placeholder?: string;
  showAllOption?: boolean;
}

export default function CategoryFilterDropdown({
  value,
  onChange,
  label = "Filter by Category",
  placeholder = "All Categories",
  showAllOption = true,
}: CategoryFilterDropdownProps) {
  // Get root categories
  const rootCategories = useQuery(
    api.categories.getRootCategories,
    { is_active: true },
  ) as
    | Array<{
      _id: Id<"categories">;
      name: string;
      parent_id?: Id<"categories">;
    }>
    | null
    | undefined;

  // Get all categories with levels to build hierarchy
  const allCategories = useQuery(
    api.categories.getCategoriesWithLevel,
    { is_active: true },
  ) as CategoryWithLevel[] | null | undefined;

  // Get selected category details
  const selectedCategory = useMemo(() => {
    if (!value || !allCategories) return null;
    return allCategories.find((cat) => cat._id === value);
  }, [value, allCategories]);

  // Build category path for display
  const getCategoryPath = (categoryId: Id<"categories">): string => {
    if (!allCategories) return "";
    const category = allCategories.find((cat) => cat._id === categoryId);
    if (!category) return "";

    if (category.level === 0) {
      return category.name;
    } else if (category.level === 1) {
      const parent = allCategories.find((cat) => cat._id === category.parent_id);
      return parent ? `${parent.name} > ${category.name}` : category.name;
    } else if (category.level === 2) {
      const parent = allCategories.find((cat) => cat._id === category.parent_id);
      if (parent) {
        const grandParent = allCategories.find(
          (cat) => cat._id === parent.parent_id,
        );
        return grandParent
          ? `${grandParent.name} > ${parent.name} > ${category.name}`
          : `${parent.name} > ${category.name}`;
      }
      return category.name;
    }
    return category.name;
  };

  // Build flat list of all categories with their paths
  const categoryOptions = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      path: getCategoryPath(cat._id),
      level: cat.level || 0,
    }));
  }, [allCategories]);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <Select
        value={value || "all"}
        onValueChange={(val) => onChange(val as Id<"categories"> | "all")}
      >
        <SelectTrigger className="w-full bg-background border-border">
          <SelectValue placeholder={placeholder}>
            {selectedCategory
              ? getCategoryPath(selectedCategory._id)
              : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {showAllOption && (
            <SelectItem value="all">
              <span className="font-semibold">All Categories</span>
            </SelectItem>
          )}
          {/* Group by root category */}
          {rootCategories?.map((rootCat) => {
            const subCategories = categoryOptions.filter(
              (cat) =>
                cat.level === 1 &&
                allCategories?.find((c) => c._id === cat._id)?.parent_id ===
                rootCat._id,
            );
            const subSubCategories = categoryOptions.filter(
              (cat) =>
                cat.level === 2 &&
                subCategories.some(
                  (subCat) =>
                    allCategories?.find((c) => c._id === cat._id)?.parent_id ===
                    subCat._id,
                ),
            );

            return (
              <div key={rootCat._id}>
                {/* Root category */}
                <SelectItem value={rootCat._id}>
                  <span className="font-medium">{rootCat.name}</span>
                </SelectItem>
                {/* Sub-categories */}
                {subCategories.map((subCat) => (
                  <SelectItem key={subCat._id} value={subCat._id}>
                    <span className="ml-4 text-sm">{subCat.path}</span>
                  </SelectItem>
                ))}
                {/* Sub-sub-categories */}
                {subSubCategories.map((subSubCat) => (
                  <SelectItem key={subSubCat._id} value={subSubCat._id}>
                    <span className="ml-8 text-sm text-muted-foreground">
                      {subSubCat.path}
                    </span>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

