import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditPartnerDialog } from "./edit-partner-dialog";
import { DeletePartnerDialog } from "./delete-partner-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "display_name",
    header: "Партнер",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const partner = row.original;

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
        <EditPartnerDialog
          partner={partner}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
        <DeletePartnerDialog
          partnerId={partner.id}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
        </>
      );
    },
  },
];