import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterItem } from "./filter-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersSectionProps {
  filters: any[];
  onFiltersChange: (filters: any[]) => void;
  suggestions?: Record<string, string[]>;
}

export function FiltersSection({ 
  filters, 
  onFiltersChange,
  suggestions = {}
}: FiltersSectionProps) {
  const addFilter = () => {
    onFiltersChange([...filters, { 
      field: "", 
      operator: "contains",
      value: "",
      value2: "",
      condition: "and"
    }]);
  };

  const updateFilter = (index: number, filter: any) => {
    const newFilters = [...filters];
    newFilters[index] = filter;
    onFiltersChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  if (filters.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-sm text-muted-foreground mb-4">
          Нет активных фильтров
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addFilter}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить фильтр
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {`${filters.length} ${filters.length === 1 ? "фильтр" : "фильтров"}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addFilter}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить фильтр
        </Button>
      </div>

      {filters.map((filter, index) => (
        <div key={index} className="relative">
          {index > 0 && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2 z-10">
              <Select
                value={filter.condition}
                onValueChange={(value) => {
                  const newFilters = [...filters];
                  newFilters[index] = { ...filter, condition: value };
                  onFiltersChange(newFilters);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">И</SelectItem>
                  <SelectItem value="or">ИЛИ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <FilterItem
            filter={filter}
            index={index}
            onUpdate={updateFilter}
            onRemove={removeFilter}
            suggestions={suggestions[filter.field]}
          />
        </div>
      ))}
    </div>
  );
}