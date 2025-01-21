import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import type { GeneratedPdf } from "@/lib/types";
import { useMemo } from "react";

interface EPLTableProps {
  epls: GeneratedPdf[];
}

export function EPLTable({ epls }: EPLTableProps) {
  const sortedEpls = useMemo(() => {
    return [...epls].sort((a, b) => 
      b.created_time.seconds - a.created_time.seconds
    );
  }, [epls]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Дата выдачи</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Документ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEpls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Нет выпущенных ЭПЛ
              </TableCell>
            </TableRow>
          ) : (
            sortedEpls.map((epl) => (
              <TableRow key={epl.id}>
                <TableCell>{epl.id}</TableCell>
                <TableCell>
                  {format(epl.created_time.toDate(), "dd.MM.yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {epl.status === "Close" ? (
                    <span className="text-success font-medium">Закрыт</span>
                  ) : (
                    <span>Открыт</span>
                  )}
                </TableCell>
                <TableCell>
                  {epl.pdf_link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <a 
                        href={epl.pdf_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}