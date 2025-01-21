import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PeriodSectionProps {
  dateRange: {
    from: string | null;
    to: string | null;
  };
  onDateRangeChange: (range: { from: string | null; to: string | null }) => void;
}

export function PeriodSection({ dateRange, onDateRangeChange }: PeriodSectionProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Начало периода</Label>
          <Input
            type="datetime-local"
            value={dateRange.from || ''}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label>Конец периода</Label>
          <Input
            type="datetime-local"
            value={dateRange.to || ''}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
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
            onDateRangeChange({
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
            onDateRangeChange({
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
            onDateRangeChange({
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
          onClick={() => onDateRangeChange({ from: null, to: null })}
        >
          Сбросить
        </Button>
      </div>
    </div>
  );
}