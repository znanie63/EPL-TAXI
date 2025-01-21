import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { columns } from "@/components/drivers/columns";
import { DriverForm } from "@/components/drivers/driver-form";
import { DataTable } from "@/components/organizations/data-table";
import { useState, useCallback } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useDrivers } from "@/hooks/use-drivers";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DriverPage } from "./driver";
import { useLocation, useNavigate } from "react-router-dom";

export function DriversPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(() => {
    const state = location.state as { 
      selectedDriverId?: string;
      showProfile?: boolean;
    };
    if (state?.selectedDriverId && state?.showProfile) {
      return state.selectedDriverId;
    }
    return null;
  });
  const { drivers, loading, addDriver, updateDriver } = useDrivers();
  const { profile } = useProfile();
  const isPartner = profile?.role === "Parthner";

  const handleDriverSelect = useCallback((driverId: string) => {
    setSelectedDriverId(driverId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedDriverId(null);
    // Clear navigation state
    navigate(".", { replace: true });
  }, []);

  // First filter drivers, then add onDriverSelect
  const filteredData = drivers
    .filter((driver) =>
    driver.display_name.toLowerCase().includes(search.toLowerCase())
    )
    .map(driver => ({
      ...driver,
      onDriverSelect: handleDriverSelect
    }));

  const handleCreate = async (data: Partial<User>) => {
    if (!profile) return;
    
    try {
      await addDriver({
        ...data,
        role: "Driver",
        driver_parthner_uid: profile.uid,
        organizationRef: data.organization_id ? 
          doc(db, 'organizations', data.organization_id) : 
          null
      });
    } catch (error) {
      console.error('Failed to create driver:', error);
      throw error;
    }
  };

  const handleUpdate = async (id: string, data: Partial<User>) => {
    try {
      await updateDriver(id, {
        ...data,
        organizationRef: data.organization_id ? 
          doc(db, 'organizations', data.organization_id) : 
          null
      });
    } catch (error) {
      console.error('Failed to update driver:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show driver details page if driver is selected
  if (selectedDriverId) {
    return <DriverPage driverId={selectedDriverId} onBack={handleBack} />;
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Водители</h1>
          <p className="text-muted-foreground">
            Управление водителями и их данными
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск водителя..."
              className="w-full md:w-[300px] pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isPartner && (
            <DriverForm
              mode="create"
              onSubmit={handleCreate}
            />
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
      />
    </div>
  );
}