import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/lib/services/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";

interface PhotoUploadProps {
  currentPhotoUrl: string | undefined;
  onPhotoUpdate: (url: string) => Promise<void>;
  disabled?: boolean;
}

export function PhotoUpload({ currentPhotoUrl, onPhotoUpdate, disabled }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const photoUrl = await storageService.uploadProfilePhoto(file);
      if (!photoUrl) {
        throw new Error('Failed to get photo URL');
      }
      await onPhotoUpdate(photoUrl);
      
      toast({
        title: "Фото обновлено",
        description: "Фото профиля успешно обновлено",
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to upload photo'));
      toast({
        title: "Ошибка",
        description: "Не удалось обновить фото профиля",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={currentPhotoUrl} alt="Profile photo" />
          <AvatarFallback>
            <UserCircle className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <Label 
          htmlFor="photo-upload" 
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors"
        >
          <Camera className="h-4 w-4" />
        </Label>
        <Input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading || disabled}
        />
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загрузка...
        </div>
      )}
      {error && (
        <div className="text-sm text-destructive">
          {error.message}
        </div>
      )}
    </div>
  );
}