import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ReportTableProps {
  data: any[];
  onColumnOrderChange?: (columns: string[]) => void;
}

export function ReportTable({
  data,
  onColumnOrderChange,
}: ReportTableProps) {
  const { eplColumns, eplShowTotals } = useStore();
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [orderedColumns, setOrderedColumns] = useState<string[]>(eplColumns);

  // Update orderedColumns when eplColumns changes
  useEffect(() => {
    setOrderedColumns(eplColumns);
  }, [eplColumns]);

  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет данных для отображения
      </div>
    );
  }

  const formatValue = (value: any, column: string) => {
    if (typeof value === 'number') {
      const currencyColumns = ['Баланс', 'Сумма выпущенных ЭПЛ', 'Остаток баланса', 'Цена ЭПЛ'];
      const countColumns = ['Количество ЭПЛ'];
      
      if (currencyColumns.includes(column)) {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      } else if (countColumns.includes(column)) {
        return value.toLocaleString('ru-RU');
      } else {
        return value;
      }
    }
    return value;
  };

  const handleDragStart = (e: React.DragEvent, column: string) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === column) return;

    const newColumns = [...orderedColumns];
    const draggedIdx = newColumns.indexOf(draggedColumn);
    const dropIdx = newColumns.indexOf(column);
    
    newColumns.splice(draggedIdx, 1);
    newColumns.splice(dropIdx, 0, draggedColumn);
    
    setOrderedColumns(newColumns);
    onColumnOrderChange?.(newColumns);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  // Calculate totals
  const totals = orderedColumns.reduce((acc, column) => {
    if (data?.[0] && typeof data[0][column] === 'number') {
      const sum = data.reduce((sum, row) => sum + (row[column] || 0), 0);
      acc[column] = sum;
    } else {
      acc[column] = '';
    }
    return acc;
  }, {} as Record<string, any>);

  // Format totals row
  const formattedTotals = orderedColumns.reduce((acc, column) => {
    if (totals[column] === '') {
      if (column === orderedColumns[0]) {
        acc[column] = 'ИТОГО';
      } else {
        acc[column] = '';
      }
    } else {
      acc[column] = formatValue(totals[column], column);
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="relative">
      <ScrollArea className="h-[500px] border rounded-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {orderedColumns.map((column) => (
                  <TableHead
                    key={column}
                    className={cn(
                      "bg-background sticky top-0 z-10 cursor-move select-none",
                      draggedColumn === column && "opacity-50"
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column)}
                    onDragOver={(e) => handleDragOver(e, column)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="whitespace-nowrap font-medium flex items-center gap-2">
                      <DragHandleDots2Icon
                        className="h-4 w-4 text-muted-foreground"
                        style={{
                          cursor: 'grab',
                          touchAction: 'none',
                        }}
                      />
                      {column}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {orderedColumns.map((column) => (
                    <TableCell 
                      key={column}
                      className="whitespace-nowrap"
                    >
                      {formatValue(row[column], column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {eplShowTotals && data?.length > 0 && (
                <TableRow className="font-medium bg-muted/50">
                  {orderedColumns.map((column) => (
                    <TableCell
                      key={column}
                      className="whitespace-nowrap"
                    >
                      {formattedTotals[column]}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* ScrollBar is now handled by the parent ScrollArea */}
        <div className="h-2" />
      </ScrollArea>
    </div>
  );
}