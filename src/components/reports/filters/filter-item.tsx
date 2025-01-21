import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { filterOperators } from "./filter-operators";
import { columnTypes } from "../columns/column-types";
import { availableColumns } from "../columns/available-columns";

interface FilterItemProps {
  filter: any;
  index: number;
  onUpdate: (index: number, filter: any) => void;
  onRemove: (index: number) => void;
  suggestions?: string[];
}

export function FilterItem({ 
  filter, 
  index, 
  onUpdate, 
  onRemove,
  suggestions 
}: FilterItemProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start border rounded-lg p-4 relative">
      <div className="space-y-2 flex-1">
        <Label>Поле</Label>
        <Select
          value={filter.field}
          onValueChange={(value) => {
            const defaultOperator = columnTypes[value] === "number" ? "eq" : "contains";
            onUpdate(index, { ...filter, field: value, value: "", operator: defaultOperator });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите поле" />
          </SelectTrigger>
          <SelectContent>
            {availableColumns.map((column) => (
              <SelectItem key={column.id} value={column.id}>
                {column.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 flex-1">
        <Label>Оператор</Label>
        <Select
          value={filter.operator}
          onValueChange={(value) => {
            const isEmptyOperator = ["empty", "not_empty"].includes(value);
            onUpdate(index, { 
              ...filter, 
              operator: value,
              value: isEmptyOperator ? "" : filter.value,
              value2: "" 
            });
          }}
          disabled={!filter.field}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите оператор" />
          </SelectTrigger>
          <SelectContent>
            {filterOperators
              .filter(op => 
                op.type === "all" || 
                (filter.field && op.type === columnTypes[filter.field])
              )
              .map((operator) => (
                <SelectItem key={operator.value} value={operator.value}>
                  <span className="mr-2">{operator.icon}</span>
                  {operator.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>

      {!filter.operator || ["empty", "not_empty"].includes(filter.operator) ? (
        <div className="col-span-2" />
      ) : filter.operator === "between" ? (
        <div className="flex gap-2 col-span-2">
          <Input
            type="number"
            placeholder="От"
            value={filter.value}
            onChange={(e) => onUpdate(index, { ...filter, value: e.target.value })}
            disabled={!filter.field || !filter.operator}
          />
          <Input
            type="number"
            placeholder="До"
            value={filter.value2}
            onChange={(e) => onUpdate(index, { ...filter, value2: e.target.value })}
            disabled={!filter.field || !filter.operator}
          />
        </div>
      ) : (
        <div className="space-y-2 col-span-2">
          <Label>Значение</Label>
          {suggestions?.length ? (
            <Select
              value={filter.value}
              onValueChange={(value) => onUpdate(index, { ...filter, value })}
              disabled={!filter.field || !filter.operator}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите значение" />
              </SelectTrigger>
              <SelectContent>
                {suggestions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={columnTypes[filter.field] === "number" ? "number" : "text"}
              value={filter.value}
              onChange={(e) => onUpdate(index, { ...filter, value: e.target.value })}
              placeholder={filter.field ? "Введите значение" : "Выберите поле"}
              disabled={!filter.field || !filter.operator}
            />
          )}
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-6 w-6"
        onClick={() => onRemove(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}