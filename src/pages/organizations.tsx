import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { columns } from "@/components/organizations/columns";
import { DataTable } from "@/components/organizations/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useOrganizations } from "@/hooks/use-organizations";
import { useProfile } from "@/hooks/use-profile";
import { AddOrganizationDialog } from "@/components/organizations/add-organization-dialog";

export function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const { organizations, loading } = useOrganizations();
  const { profile } = useProfile();
  const isPartner = profile?.role === "Parthner";

  const filteredData = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl md:text-3xl font-bold">Организации</h1>
          <p className="text-muted-foreground">
            Управление организациями и их данными
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск организации..."
              className="w-full md:w-[300px] pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isPartner && <AddOrganizationDialog />}
        </div>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}