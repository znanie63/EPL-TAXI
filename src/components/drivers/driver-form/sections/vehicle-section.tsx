/**
 * Vehicle information form section component
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Car, Tag, Hash } from "lucide-react";

interface VehicleSectionProps {
  data: {
    car_make: string;
    car_class: string;
    car_plate: string;
    garage_number: string;
  };
  onChange: (data: any) => void;
}

export function VehicleSection({ data, onChange }: VehicleSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Car className="h-5 w-5" />
        Автомобиль
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="car_make" className="flex items-center gap-2">
              <Car className="h-4 w-4" /> Марка машины
            </Label>
            <Input
              id="car_make"
              value={data.car_make}
              onChange={(e) =>
                onChange({ ...data, car_make: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="car_class" className="flex items-center gap-2">
              <Tag className="h-4 w-4" /> Класс автомобиля
            </Label>
            <Input
              id="car_class"
              value={data.car_class}
              onChange={(e) =>
                onChange({ ...data, car_class: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="car_plate" className="flex items-center gap-2">
              <Tag className="h-4 w-4" /> Государственный номер
            </Label>
            <Input
              id="car_plate"
              value={data.car_plate}
              onChange={(e) =>
                onChange({ ...data, car_plate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="garage_number" className="flex items-center gap-2">
              <Hash className="h-4 w-4" /> Гаражный номер
            </Label>
            <Input
              id="garage_number"
              value={data.garage_number}
              onChange={(e) =>
                onChange({ ...data, garage_number: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}