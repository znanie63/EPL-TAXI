import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Car, Phone, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDrivers } from "@/hooks/use-drivers";
import { useOrganizations } from "@/hooks/use-organizations";
import { useEPL } from "@/hooks/use-epl";
import { EPLTable } from "@/components/driver/epl-table";
import { BalanceHistory } from "@/components/driver/balance-history";
import { TopUpBalanceDialog } from "@/components/driver/top-up-balance-dialog";
import { format } from "date-fns";

interface DriverPageProps {
  driverId: string;
  onBack: () => void;
}

export function DriverPage({ driverId, onBack }: DriverPageProps) {
  const { drivers } = useDrivers();
  const { organizations } = useOrganizations();
  const { epls } = useEPL(driverId);
  const navigate = useNavigate();
  
  const driver = drivers.find(d => d.id === driverId);
  const organization = organizations.find(org => 
    org.id === driver?.organizationRef?.id
  );

  if (!driver) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          Водитель не найден
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="-ml-2 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {driver.display_name}
              <CardDescription className="mt-2 text-sm font-normal">
                Добавлен в систему: {driver.created_time && typeof driver.created_time === 'object' && driver.created_time.toDate ? 
                  format(driver.created_time.toDate(), "dd.MM.yyyy HH:mm") : 
                  "Дата не указана"}
              </CardDescription>
            </CardTitle>
            <TopUpBalanceDialog driverId={driverId} />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Организация
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{organization?.name || "Не указана"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Автомобиль
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {driver.car_make} {driver.car_plate && `(${driver.car_plate})`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Контакты
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{driver.phone_number || "Не указан"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{driver.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Баланс
                  </div>
                  <div className="text-2xl font-bold">
                    {driver.balance?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="epls" className="space-y-6 w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="epls" className="text-sm py-2.5">
              ЭПЛ
            </TabsTrigger>
            <TabsTrigger value="balance" className="text-sm py-2.5">
              История баланса
            </TabsTrigger>
          </TabsList>

          <TabsContent value="epls" className="space-y-4">
            <EPLTable epls={epls} />
          </TabsContent>

          <TabsContent value="balance" className="space-y-4">
            <BalanceHistory driverId={driverId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}