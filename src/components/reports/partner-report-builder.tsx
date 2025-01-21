import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Filter, Columns, Calendar, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useState } from "react";

const availableColumns = [
  { id: "Партнер", label: "Партнер" },
  { id: "Email", label: "Email" },
  { id: "Количество водителей", label: "Количество водителей" },
  { id: "Количество организаций", label: "Количество организаций" },
  { id: "Количество ЭПЛ", label: "Количество ЭПЛ" },
  { id: "Цена ЭПЛ", label: "Цена ЭПЛ" },
  { id: "Сумма выпущенных ЭПЛ", label: "Сумма выпущенных ЭПЛ" },
];

export function PartnerReportBuilder() {
  const [openSections, setOpenSections] = useState({
    columns: true,
    period: true,
  });

  const { 
    partnerColumns,
    setPartnerColumns,
    partnerShowTotals,
    setPartnerShowTotals,
    partnerDateRange,
    setPartnerDateRange
  } = useStore();

  const toggleColumn = (columnId: string) => {
    if (partnerColumns.includes(columnId)) {
      setPartnerColumns(partnerColumns.filter(id => id !== columnId));
    } else {
      setPartnerColumns([...partnerColumns, columnId]);
    }
  };

  return (
    <div className="space-y-6">
      <Collapsible
        open={openSections.columns}
        onOpenChange={(open) => setOpenSections({ ...openSections, columns: open })}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Columns className="h-5 w-5" />
            <h3 className="text-lg font-medium">Столбцы отчета</h3>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${openSections.columns ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="show-totals" className="text-sm">
                Показывать итоги
              </Label>
              <Switch
                id="show-totals"
                checked={partnerShowTotals}
                onCheckedChange={setPartnerShowTotals}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {availableColumns.map((column) => (
                <Badge
                  key={column.id}
                  variant={partnerColumns.includes(column.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleColumn(column.id)}
                >
                  {column.label}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible
        open={openSections.period}
        onOpenChange={(open) => setOpenSections({ ...openSections, period: open })}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-medium">Период</h3>
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${openSections.period ? 'rotate-90' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Начало периода</Label>
                <Input
                  type="datetime-local"
                  value={partnerDateRange.from || ''}
                  onChange={(e) => setPartnerDateRange({ ...partnerDateRange, from: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Конец периода</Label>
                <Input
                  type="datetime-local"
                  value={partnerDateRange.to || ''}
                  onChange={(e) => setPartnerDateRange({ ...partnerDateRange, to: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  setPartnerDateRange({
                    from: today.toISOString().slice(0, 16),
                    to: now.toISOString().slice(0, 16)
                  });
                }}
              >
                Сегодня
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setPartnerDateRange({
                    from: weekAgo.toISOString().slice(0, 16),
                    to: now.toISOString().slice(0, 16)
                  });
                }}
              >
                Неделя
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                  setPartnerDateRange({
                    from: monthAgo.toISOString().slice(0, 16),
                    to: now.toISOString().slice(0, 16)
                  });
                }}
              >
                Месяц
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartnerDateRange({ from: null, to: null })}
              >
                Сбросить
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}