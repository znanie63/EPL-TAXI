import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/use-employees";
import { useState } from "react";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";
import { AssignEmployeesDialog } from "./assign-employees-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Organization } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { useOrganizations } from "@/hooks/use-organizations";
import { getDriversWord } from "@/lib/utils";

import { useDrivers } from "@/hooks/use-drivers";
import { DriversListDialog } from "./drivers-list-dialog";

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    id: "driversCount",
    header: "Водители",
    cell: ({ row }) => {
      const [dialogOpen, setDialogOpen] = useState(false);
      const { drivers } = useDrivers();
      const organizationId = row.original.id;
      
      const driversCount = drivers.filter(driver => 
        driver.organizationRef?.id === organizationId
      ).length;
      
      return (
        <>
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => setDialogOpen(true)}
        >
          <span className="font-medium">{driversCount}</span>
          <span className="text-muted-foreground ml-1">{getDriversWord(driversCount)}</span>
        </Button>
        <DriversListDialog
          organizationId={organizationId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
        </>
      );
    },
  },
  {
    id: "employees",
    header: "Сотрудники на линии",
    cell: ({ row }) => {
      const [assignDialogOpen, setAssignDialogOpen] = useState(false);
      const { employees } = useEmployees();
      const organizationId = row.original.id;
      
      const assignedEmployees = employees.filter(emp => 
        emp.organization_ref?.id === organizationId
      );
      
      const hasMedic = assignedEmployees.some(emp => emp.type === "med");
      const hasTechnician = assignedEmployees.some(emp => emp.type === "teh");
      const allAssigned = hasMedic && hasTechnician;
      
      return (
        <>
          <Badge
            variant={allAssigned ? "success" : "destructive"}
            className="cursor-pointer"
            onClick={() => setAssignDialogOpen(true)}
          >
            {allAssigned ? "Назначены" : "Требуются сотрудники"}
          </Badge>
          <AssignEmployeesDialog
            organizationId={row.original.id}
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
          />
        </>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const organization = row.original;
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const { setOrganizations } = useOrganizations();
      const { employees } = useEmployees();
      
      const organizationId = row.original.id;

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
            <DropdownMenuItem
              onClick={() => setEditDialogOpen(true)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
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
        <DeleteOrganizationDialog
          organizationId={organization.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
        <EditOrganizationDialog
          organization={organization}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
        </>
      );
    },
  },
];