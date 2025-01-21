import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { PartnerReportBuilder } from "@/components/reports/partner-report-builder";
import { PartnerReportTable } from "@/components/reports/partner-report-table";
import { ExportReportDialog } from "@/components/reports/export-report-dialog";
import { usePartnerReports } from "@/hooks/use-partner-reports";
import { useProfile } from "@/hooks/use-profile";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";

export function PartnerReportsPage() {
  const [search, setSearch] = useState("");
  const [orderedColumns, setOrderedColumns] = useState<string[]>([]);
  const { loading, reportData } = usePartnerReports();
  const { profile, loading: profileLoading } = useProfile();
  const { partnerColumns } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileLoading && profile?.role !== 'Super') {
      navigate('/organizations', { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    setOrderedColumns(partnerColumns);
  }, [partnerColumns]);

  if (loading || profileLoading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Additional check to prevent rendering if not Super
  if (profile?.role !== 'Super') {
    return null;
  }

  return (
    <div className="w-full p-4 md:p-6 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Отчет по партнерам</h1>
          <p className="text-muted-foreground">
            Сводная статистика по всем партнерам
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по отчетам..."
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <ExportReportDialog 
              data={reportData} 
              orderedColumns={orderedColumns.length ? orderedColumns : partnerColumns}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-4 md:p-6 overflow-hidden">
          <PartnerReportBuilder />
        </Card>
        
        <Card className="p-4 md:p-6 overflow-hidden">
          <PartnerReportTable 
            data={reportData} 
            onColumnOrderChange={setOrderedColumns}
          />
        </Card>
      </div>
    </div>
  );
}