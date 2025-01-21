/**
 * Driver's license form section component
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BadgeCheck, Calendar } from "lucide-react";

interface LicenseSectionProps {
  data: {
    licenseNumber: string;
    licenseIssuedDate: string;
    licenseExpiryDate: string;
  };
  onChange: (data: any) => void;
}

export function LicenseSection({ data, onChange }: LicenseSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <BadgeCheck className="h-5 w-5" />
        Водительское удостоверение
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" /> Номер водительского удостоверения
          </Label>
          <Input
            id="licenseNumber"
            value={data.licenseNumber}
            onChange={(e) =>
              onChange({ ...data, licenseNumber: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseIssuedDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Дата выдачи
            </Label>
            <Input
              id="licenseIssuedDate"
              type="date"
              value={data.licenseIssuedDate}
              onChange={(e) =>
                onChange({ ...data, licenseIssuedDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseExpiryDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Действует до
            </Label>
            <Input
              id="licenseExpiryDate"
              type="date"
              value={data.licenseExpiryDate}
              onChange={(e) =>
                onChange({ ...data, licenseExpiryDate: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}