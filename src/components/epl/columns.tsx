import { ColumnDef } from "@tanstack/react-table";
import type { GeneratedPdf } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const columns: ColumnDef<GeneratedPdf>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return row.getValue("id");
    },
  },
  {
    accessorKey: "created_time",
    header: "Дата выдачи",
    cell: ({ row }) => {
      const timestamp = row.getValue("created_time") as any;
      return format(timestamp.toDate(), "dd.MM.yyyy HH:mm");
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status");
      if (status === "Close") {
        return <span className="text-success font-medium">Закрыт</span>;
      }
      return <span>Открыт</span>;
    },
  },
  {
    accessorKey: "pdf_link",
    header: "Документ",
    cell: ({ row }) => {
      const pdfLink = row.getValue("pdf_link") as string;
      if (!pdfLink) return null;
      
      return (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          asChild
        >
        <a 
          href={pdfLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText className="h-4 w-4" />
          PDF
        </a>
        </Button>
      );
    },
  },
];