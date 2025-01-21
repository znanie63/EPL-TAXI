export const filterOperators = [
  { value: "eq", label: "Равно", type: "all", icon: "=" },
  { value: "neq", label: "Не равно", type: "all", icon: "≠" },
  { value: "contains", label: "Содержит", type: "text", icon: "⊃" },
  { value: "not_contains", label: "Не содержит", type: "text", icon: "⊅" },
  { value: "gt", label: "Больше", type: "number", icon: ">" },
  { value: "gte", label: "Больше или равно", type: "number", icon: "≥" },
  { value: "lt", label: "Меньше", type: "number", icon: "<" },
  { value: "lte", label: "Меньше или равно", type: "number", icon: "≤" },
  { value: "between", label: "В диапазоне", type: "number", icon: "↔" },
  { value: "empty", label: "Пусто", type: "all", icon: "∅" },
  { value: "not_empty", label: "Не пусто", type: "all", icon: "∃" },
];