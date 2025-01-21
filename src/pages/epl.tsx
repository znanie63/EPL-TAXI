import { columns } from "@/components/epl/columns";
import { DataTable } from "@/components/organizations/data-table";
import { ArrowLeft, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEPL } from "@/hooks/use-epl";
import { useDrivers } from "@/hooks/use-drivers";
import { useState } from "react";
import { format } from "date-fns";

interface EPLPageProps {
  driverId: string;
  onBack: () => void;
}

export function EPLPage({ driverId, onBack }: EPLPageProps) {
  const { epls, loading: eplsLoading } = useEPL(driverId);
  const { drivers, loading: driversLoading } = useDrivers();
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  // Ensure we're using the correct driver ID for lookup
  const driver = drivers.find(driver => driver.id === driverId);

  if (eplsLoading || driversLoading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          Водитель не найден
        </div>
      </div>
    );
  }

  const filteredData = epls.filter(epl => {
    const matchesSearch = search === "" || epl.id.toString().includes(search);
    const matchesDate = !dateFilter || format(epl.created_time.toDate(), "yyyy-MM-dd") === dateFilter;
    const matchesStatus = statusFilter === "all" || epl.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-hidden">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-2 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Электронные путевые листы
          </h1>
          <p className="text-muted-foreground">
            Водитель: {driver.display_name}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск по ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="w-[200px]">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="Open">Открыт</SelectItem>
              <SelectItem value="Close">Закрыт</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}