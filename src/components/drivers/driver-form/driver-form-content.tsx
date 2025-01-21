/**
 * Form content component that handles the actual form fields and sections
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PersonalInfoSection } from "./sections/personal-info-section";
import { DocumentsSection } from "./sections/documents-section";
import { LicenseSection } from "./sections/license-section";
import { VehicleSection } from "./sections/vehicle-section";
import { PermitsSection } from "./sections/permits-section";
import { OrganizationSection } from "./sections/organization-section";
import { QRSection } from "./sections/qr-section";
import { Wand2 } from "lucide-react";
import { generateMockDriverData } from "@/lib/utils/mock-data";
import type { User } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { storageService } from "@/lib/services/storage";

interface DriverFormContentProps {
  driver?: User;
  initialData?: Partial<User>;
  mode: 'create' | 'edit';
  onSubmit: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  className?: string;
}

export function DriverFormContent({
  driver,
  initialData,
  mode,
  onSubmit,
  loading,
  onCancel,
  className
}: DriverFormContentProps) {
  const [formData, setFormData] = useState({
    // Personal Info
    display_name: initialData?.display_name || driver?.display_name || "",
    phone_number: initialData?.phone_number || driver?.phone_number || "",
    email: initialData?.email || driver?.email || "",
    password: initialData?.password || driver?.password || "",
    role: "Driver",
    
    // Documents
    inn: initialData?.inn || driver?.inn || "",
    snils: initialData?.snils || driver?.snils || "",
    employeeNumber: initialData?.employeeNumber || driver?.employeeNumber || "",
    numerId: initialData?.numerId || driver?.numerId || "",
    
    // License
    licenseNumber: initialData?.licenseNumber || driver?.licenseNumber || "",
    licenseIssuedDate: driver?.licenseIssuedDate && typeof driver.licenseIssuedDate === 'object' && driver.licenseIssuedDate.toDate ? 
      driver.licenseIssuedDate.toDate().toISOString().split('T')[0] : 
      initialData?.licenseIssuedDate || "",
    licenseExpiryDate: driver?.licenseExpiryDate && typeof driver.licenseExpiryDate === 'object' && driver.licenseExpiryDate.toDate ? 
      driver.licenseExpiryDate.toDate().toISOString().split('T')[0] : 
      initialData?.licenseExpiryDate || "",
    
    // Vehicle
    car_make: initialData?.car_make || driver?.car_make || "",
    car_class: initialData?.car_class || driver?.car_class || "",
    car_plate: initialData?.car_plate || driver?.car_plate || "",
    garage_number: initialData?.garage_number || driver?.garage_number || "",
    
    // Permits
    permitNumber: initialData?.permitNumber || driver?.permitNumber || "",
    osgop: initialData?.osgop || driver?.osgop || "",
    qr_link: initialData?.qr_link || driver?.qr_link || "",
    
    // Organization
    organization_id: initialData?.organization_id || driver?.organizationRef?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove balance and internal fields
    const { balance, _qrFile, ...formDataWithoutFields } = formData;
    
    try {
      const now = Timestamp.now();
      
      // Upload QR if present
      let qr_link = formData.qr_link;
      if (_qrFile) {
        try {
          qr_link = await storageService.uploadQR(_qrFile);
        } catch (error) {
          console.error('Failed to upload QR:', error);
          throw new Error('Failed to upload QR code');
        }
      }
      
      const data: Partial<User> = {
        ...formDataWithoutFields,
        qr_link,
        // Set organization reference
        organizationRef: formData.organization_id ? 
          doc(db, 'organizations', formData.organization_id) : 
          null,
        // Convert dates to Timestamps
        licenseIssuedDate: formData.licenseIssuedDate && 
          Timestamp.fromDate(new Date(formData.licenseIssuedDate + 'T00:00:00')),
        licenseExpiryDate: formData.licenseExpiryDate && 
          Timestamp.fromDate(new Date(formData.licenseExpiryDate + 'T00:00:00'))
      };
      
      if (mode === 'create') {
        data.created_time = now;
      }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error; // Re-throw to allow parent component to handle
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6 overflow-y-auto flex-1", className)}>
      <PersonalInfoSection
        data={formData}
        mode={mode}
        onChange={setFormData}
      />
      
      <DocumentsSection
        data={formData}
        onChange={setFormData}
      />
      
      <LicenseSection
        data={formData}
        onChange={setFormData}
      />
      
      <VehicleSection
        data={formData}
        onChange={setFormData}
      />
      
      <PermitsSection
        data={formData}
        onChange={setFormData}
      />
      
      <QRSection
        data={formData}
        onChange={setFormData}
      />
      
      <OrganizationSection
        data={formData}
        onChange={setFormData}
      />

      <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-background pb-6">
        {import.meta.env.DEV && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData(generateMockDriverData())}
            className="gap-2 mr-auto"
          >
            <Wand2 className="h-4 w-4" />
            Тестовые данные
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          Отмена
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          {loading ? (mode === 'create' ? "Добавление..." : "Сохранение...") : 
                    (mode === 'create' ? "Добавить" : "Сохранить")}
        </Button>
      </div>
    </form>
  );
}