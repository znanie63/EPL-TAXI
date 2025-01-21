/**
 * Permits and certifications form section component
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileCheck, FileText } from "lucide-react";

interface PermitsSectionProps {
  data: {
    permitNumber: string;
    osgop: string;
  };
  onChange: (data: any) => void;
}

export function PermitsSection({ data, onChange }: PermitsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <FileCheck className="h-5 w-5" />
        Разрешительные документы
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="permitNumber" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Номер разрешения
            </Label>
            <Input
              id="permitNumber"
              value={data.permitNumber}
              onChange={(e) =>
                onChange({ ...data, permitNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="osgop" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> ОСГОП
            </Label>
            <Input
              id="osgop"
              value={data.osgop}
              onChange={(e) =>
                onChange({ ...data, osgop: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}