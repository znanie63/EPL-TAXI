import { MoreHorizontal, Pencil, Trash, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { CopyEmployeeDialog } from "./copy-employee-dialog";
import { useOrganizations } from "@/hooks/use-organizations";
import { useState } from "react";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Employee } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/use-employees";
import { Building2, Unlink } from "lucide-react";

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "ФИО",
  },
  {
    accessorKey: "type",
    header: "Тип",
    cell: ({ row }) => {
      const type = row.getValue("type");
      return type === "med" ? "Медик" : "Техник";
    }
  },
  {
    id: "organization",
    header: "Организация",
    cell: ({ row }) => {
      const { organizations } = useOrganizations();
      const employee = row.original;
      const organization = organizations.find(org => 
        org.id === employee.organization_ref?.id
      );

      if (!organization) return "Не прикреплен";

      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{organization.name}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [copyDialogOpen, setCopyDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const employee = row.original;
      const { updateEmployee } = useEmployees();

      const handleUnlink = async () => {
        try {
          await updateEmployee(employee.id, {
            organization_ref: null
          });
        } catch (error) {
          console.error("Failed to unlink employee:", error);
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
              {employee.organization_ref && (
                <DropdownMenuItem
                  onClick={handleUnlink}
                  className="cursor-pointer text-orange-500"
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Открепить
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setEditDialogOpen(true)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault(); // Prevent menu from closing
                  setCopyDialogOpen(true);
                }}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                Копировать
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="cursor-pointer text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditEmployeeDialog
            employee={employee}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <CopyEmployeeDialog
            employee={employee}
            open={copyDialogOpen}
            onOpenChange={setCopyDialogOpen}
          />
          <DeleteEmployeeDialog
            employeeId={employee.id}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      );
    },
  },
];