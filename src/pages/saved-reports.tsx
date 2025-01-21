import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, AlertTriangle, Eye } from "lucide-react";
import { useSavedReports } from "@/hooks/use-saved-reports";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export function SavedReportsPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { savedReports, deleteReport } = useSavedReports(); 
  const { loadSavedReport, setCurrentPage } = useStore();
  const navigate = useNavigate();

  const filteredReports = savedReports.filter(report =>
    report.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewReport = (report: SavedReport) => {
    loadSavedReport(report);
    setCurrentPage('reports');
    navigate('/reports');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReport(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Сохраненные шаблоны</h1>
          <p className="text-muted-foreground">
            Управление сохраненными шаблонами
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск шаблона..."
            className="w-full md:w-[300px] pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-4 md:p-6 overflow-hidden">
        <div className="relative">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      Нет сохраненных шаблонов
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        {format(report.created_time.toDate(), 'dd.MM.yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                            Открыть
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Удаление отчета
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот отчет? Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}