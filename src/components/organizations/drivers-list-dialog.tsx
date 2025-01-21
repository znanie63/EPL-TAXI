import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDrivers } from "@/hooks/use-drivers";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DriversListDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriversListDialog({ 
  organizationId,
  open, 
  onOpenChange 
}: DriversListDialogProps) {
  const [search, setSearch] = useState("");
  const { drivers } = useDrivers();
  const navigate = useNavigate();

  // Filter drivers by organization
  const organizationDrivers = drivers.filter(
    driver => driver.organizationRef?.id === organizationId
  );

  // Filter by search
  const filteredDrivers = organizationDrivers.filter(driver =>
    driver.display_name.toLowerCase().includes(search.toLowerCase()) ||
    driver.phone_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDriverClick = (driverId: string) => {
    onOpenChange(false);
    navigate("/drivers", {
      state: {
        selectedDriverId: driverId,
        showProfile: true
      },
      replace: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Список водителей</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск водителя..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead className="text-right">Баланс</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Нет водителей
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver) => (
                  <TableRow key={driver.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-medium"
                        onClick={() => handleDriverClick(driver.id)}
                      >
                        {driver.display_name}
                      </Button>
                    </TableCell>
                    <TableCell>{driver.phone_number}</TableCell>
                    <TableCell className="text-right font-medium">
                      {driver.balance?.toLocaleString('ru-RU')} ₽
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}