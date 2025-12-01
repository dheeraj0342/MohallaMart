export function resolveSelectionId(selectedCategory, selectedSubCategory, selectedSubSubCategory) {
  if (selectedSubSubCategory) return selectedSubSubCategory;
  if (selectedSubCategory) return selectedSubCategory;
  if (selectedCategory) return selectedCategory;
  return "";
}

export function normalizeOptionalValue(val) {
  return val === "none" ? "" : val;
}
