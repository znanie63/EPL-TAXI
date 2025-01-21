/**
 * Documents form section component
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Hash, CreditCard, BadgeCheck } from "lucide-react";

interface DocumentsSectionProps {
  data: {
    inn: string;
    snils: string;
    employeeNumber: string;
    numerId: string;
  };
  onChange: (data: any) => void;
}

export function DocumentsSection({ data, onChange }: DocumentsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Документы
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inn" className="flex items-center gap-2">
              <Hash className="h-4 w-4" /> ИНН
            </Label>
            <Input
              id="inn"
              value={data.inn}
              onChange={(e) =>
                onChange({ ...data, inn: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="snils" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> СНИЛС
            </Label>
            <Input
              id="snils"
              value={data.snils}
              onChange={(e) =>
                onChange({ ...data, snils: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeNumber" className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" /> Табельный номер
            </Label>
            <Input
              id="employeeNumber"
              value={data.employeeNumber}
              onChange={(e) =>
                onChange({ ...data, employeeNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numerId" className="flex items-center gap-2">
              <Hash className="h-4 w-4" /> ID водителя
            </Label>
            <Input
              id="numerId"
              value={data.numerId}
              onChange={(e) =>
                onChange({ ...data, numerId: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}