import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { columns } from "@/components/employees/columns";
import { DataTable } from "@/components/organizations/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useEmployees } from "@/hooks/use-employees";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const { employees, loading } = useEmployees();
  const { profile } = useProfile();
  const isPartner = profile?.role === "Parthner";

  const filteredData = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Сотрудники</h1>
          <p className="text-muted-foreground">
            Управление сотрудниками и их данными
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск сотрудника..."
              className="w-full md:w-[300px] pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isPartner && <AddEmployeeDialog />}
        </div>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}