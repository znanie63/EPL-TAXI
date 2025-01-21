import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Building, Shield, Loader2, CreditCard } from "lucide-react";
import { PhotoUpload } from "@/components/profile/photo-upload";
import { useProfile } from "@/hooks/use-profile";
import { useState } from "react";

export function ProfilePage() {
  const { profile, loading, updateProfile, setProfile } = useProfile();
  const [updating, setUpdating] = useState(false);

  const handlePhotoUpdate = async (photoUrl: string) => {
    if (!profile) return;
    setUpdating(true);

    try {
      await updateProfile({
        photo_url: photoUrl
      });
      // Update local state after successful API update
      setProfile({ ...profile, photo_url: photoUrl });
    } catch (error) {
      console.error('Error updating photo:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full p-4 md:p-6">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Профиль не найден
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Профиль</h1>
        <p className="text-muted-foreground mt-2">
          Управление профилем и настройками
        </p>
      </div>
      
      <div className="grid gap-6 w-full">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Личная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <PhotoUpload
                key={profile.photo_url} // Force remount on photo change
                currentPhotoUrl={profile.photo_url}
                onPhotoUpdate={handlePhotoUpdate}
                disabled={updating}
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-lg font-medium">
                    <UserCircle className="h-5 w-5" />
                    <span>{profile.display_name}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{profile.organizationRef ? "Есть" : "Нет"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-primary">
                    {profile.role === "Super" ? "Супер админ" : 
                     profile.role === "Driver" ? "Водитель" : 
                     profile.role === "Parthner" ? "Партнер" : 
                     "Неизвестная роль"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          {profile.role === 'Parthner' && (
            <>
              <CardHeader className="pb-4 border-t">
                <CardTitle>Информация о тарифах</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Стоимость выпуска ЭПЛ</div>
                    <div className="text-xl font-bold">{profile.epl_price?.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}