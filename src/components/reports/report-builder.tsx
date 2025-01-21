import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Columns, Calendar } from "lucide-react";
import { useStore } from "@/lib/store";
import { useReports } from "@/hooks/use-reports";
import { ColumnsSection } from "./columns/columns-section";
import { PeriodSection } from "./period/period-section";
import { FiltersSection } from "./filters/filters-section";

export function ReportBuilder() {
  const [activeTab, setActiveTab] = useState("columns");
  const { 
    reportFilters, 
    setReportFilters,
    eplColumns,
    setEplColumns,
    eplShowTotals,
    setEplShowTotals,
    eplDateRange,
    setEplDateRange
  } = useStore();
  const { rawData } = useReports();

  // Get field suggestions for dropdowns
  const getSuggestions = () => {
    if (!rawData?.length) return {};
    
    const suggestions: Record<string, string[]> = {};
    
    // Get unique values for text fields
    ["ФИО", "Организация"].forEach(field => {
      const values = Array.from(new Set(
        rawData
          .map(row => row[field])
          .filter(val => val != null && val !== '')
      )).sort();
      
      if (values.length) {
        suggestions[field] = values;
      }
    });
    
    return suggestions;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="columns" className="gap-2">
          <Columns className="h-4 w-4" />
          <span className="hidden sm:inline">Столбцы</span>
        </TabsTrigger>
        <TabsTrigger value="period" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Период</span>
        </TabsTrigger>
        <TabsTrigger value="filters" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Фильтры</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="columns">
        <ColumnsSection
          selectedColumns={eplColumns}
          showTotals={eplShowTotals}
          onColumnsChange={setEplColumns}
          onShowTotalsChange={setEplShowTotals}
        />
      </TabsContent>

      <TabsContent value="period">
        <PeriodSection
          dateRange={eplDateRange}
          onDateRangeChange={setEplDateRange}
        />
      </TabsContent>

      <TabsContent value="filters">
        <FiltersSection
          filters={reportFilters}
          onFiltersChange={setReportFilters}
          suggestions={getSuggestions()}
        />
      </TabsContent>
    </Tabs>
  );
}