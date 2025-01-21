import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { DriverForm } from "./driver-form";
import { DeleteDriverDialog } from "./delete-driver-dialog";
import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { TopUpBalanceDialog } from "@/components/driver/top-up-balance-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User, SortDirection } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { useDrivers } from "@/hooks/use-drivers";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "display_name",
    header: "ФИО",
    sortingFn: "text",
    cell: ({ row }) => {
      const driver = row.original;
      return (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-left whitespace-nowrap"
          onClick={() => driver.onDriverSelect?.(driver.id)}
        >
          {driver.display_name}
        </Button>
      );
    },
  },
  {
    accessorKey: "phone_number",
    header: "Телефон",
    sortingFn: "text",
    cell: ({ row }) => {
      const phone = row.getValue("phone_number");
      return (
        <span className="whitespace-nowrap">
          {phone}
        </span>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Баланс",
    sortingFn: "basic",
    size: 140,
    cell: ({ row }) => {
      const { profile } = useProfile();
      const isSuper = profile?.role === 'Super';
      const balance = row.getValue("balance");
      
      return (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span>{balance} ₽</span>
          {isSuper && (
            <TopUpBalanceDialog driverId={row.original.id} trigger={
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            } />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "created_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Создан
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    sortingFn: "datetime",
    cell: ({ row }) => {
      const timestamp = row.getValue("created_time");
      if (!timestamp || typeof timestamp !== 'object' || !timestamp.toDate) return "—";
      try {
        return format(timestamp.toDate(), "dd.MM.yyyy");
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return "—";
      }
    },
  },
  {
    id: "actions",
    size: 50,
    cell: ({ row }) => {
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const driver = row.original;
      const { updateDriver, deleteDriver } = useDrivers();

      const handleUpdate = async (data: Partial<User>) => {
        try {
          await updateDriver(driver.id, data);
        } catch (error) {
          console.error('Failed to update driver:', error);
          throw error;
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Открыть меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DriverForm
                mode="edit"
                driver={driver}
                onSubmit={handleUpdate}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Редактировать
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="cursor-pointer text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteDriverDialog
            driverId={driver.id}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      );
    },
  },
];