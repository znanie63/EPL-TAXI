/**
 * Organization selection form section component
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizations } from "@/hooks/use-organizations";

interface OrganizationSectionProps {
  data: {
    organization_id: string;
  };
  onChange: (data: any) => void;
}

export function OrganizationSection({ data, onChange }: OrganizationSectionProps) {
  const { organizations } = useOrganizations();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        Организация
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Выберите организацию
          </Label>
          <Select
            value={data.organization_id}
            onValueChange={(value) =>
              onChange({ ...data, organization_id: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите организацию" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}