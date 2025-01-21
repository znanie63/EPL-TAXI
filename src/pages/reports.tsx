import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportBuilder } from "@/components/reports/report-builder";
import { ReportTable } from "@/components/reports/report-table";
import { ExportReportDialog } from "@/components/reports/export-report-dialog";
import { SaveReportDialog } from "@/components/reports/save-report-dialog";
import { useReports } from "@/hooks/use-reports";
import { useStore } from "@/lib/store";

export function ReportsPage() {
  const [orderedColumns, setOrderedColumns] = useState<string[]>([]);
  const { loading, reportData } = useReports();
  const { eplColumns, setEplColumns } = useStore();
  
  useEffect(() => {
    setOrderedColumns(eplColumns);
  }, [eplColumns]);

  // Update selected columns when order changes
  useEffect(() => {
    if (orderedColumns.length) {
      setEplColumns(orderedColumns);
    }
  }, [orderedColumns, setEplColumns]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Отчеты</h1>
          <p className="text-muted-foreground">
            Конструктор отчетов по статистике ЭПЛ
          </p>
        </div>
        <div className="flex gap-2">
          <ExportReportDialog 
            data={reportData} 
            orderedColumns={orderedColumns}
          />
          <SaveReportDialog />
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-4 md:p-6 overflow-hidden">
          <ReportBuilder />
        </Card>
        
        <Card className="p-4 md:p-6 overflow-hidden">
          <ReportTable 
            data={reportData} 
            onColumnOrderChange={setOrderedColumns}
          />
        </Card>
      </div>
    </div>
  );
}