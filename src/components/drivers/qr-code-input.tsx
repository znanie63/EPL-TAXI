import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Image } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";

interface QRCodeInputProps {
  onQRGenerated: (file: File | null) => void;
  currentQrUrl?: string;
}

export function QRCodeInput({ onQRGenerated, currentQrUrl }: QRCodeInputProps) {
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrLink, setQrLink] = useState("");
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      // Create an image element
      const img = document.createElement('img');
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      
      try {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        canvas.width = 700;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          toast({
            title: "Ошибка",
            description: "Не удалось обработать изображение",
            variant: "destructive",
          });
          return;
        }
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, 700, 700);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            toast({
              title: "Ошибка",
              description: "Не удалось обработать изображение",
              variant: "destructive",
            });
            return;
          }
          
          // Create File from Blob
          const resizedFile = new File([blob], file.name, {
            type: 'image/png',
            lastModified: Date.now(),
          });
          
          setQrFile(resizedFile);
          setQrPreviewUrl(URL.createObjectURL(resizedFile));
          onQRGenerated(resizedFile);
        }, 'image/png');
      } finally {
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать изображение",
        variant: "destructive",
      });
    }
  };

  const handleLinkSubmit = async () => {
    if (!qrLink) return;

    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(qrLink, {
        width: 700,
        height: 700,
        margin: 1,
      });

      // Convert data URL to Blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Create File object
      const file = new File([blob], "qr-code.png", { type: "image/png" });

      setQrFile(file);
      setQrPreviewUrl(qrDataUrl);
      onQRGenerated(file);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  return (
    <Tabs defaultValue="upload" className="w-full space-y-4">
      {currentQrUrl && (
        <div className="mb-4">
          <UILabel>Текущий QR код</UILabel>
          <div className="mt-2 aspect-square w-32 rounded-lg border bg-muted">
            <img
              src={currentQrUrl}
              alt="Текущий QR код"
              className="h-full w-full object-contain p-2"
            />
          </div>
        </div>
      )}

      <TabsList className="grid w-full grid-cols-2 h-auto sm:h-10">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Загрузить QR</span>
          <span className="sm:hidden">Загрузить</span>
        </TabsTrigger>
        <TabsTrigger value="generate" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Сгенерировать из ссылки</span>
          <span className="sm:hidden">Создать</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
      </TabsContent>

      <TabsContent value="generate" className="space-y-4">
        <div className="space-y-4">
          <UILabel htmlFor="qr-link">Ссылка для QR кода</UILabel>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="qr-link"
              value={qrLink}
              onChange={(e) => setQrLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
            <Button 
              type="button" 
              onClick={handleLinkSubmit}
              disabled={!qrLink}
              className="w-full sm:w-auto"
            >
              Создать
            </Button>
          </div>
        </div>
      </TabsContent>

      {qrPreviewUrl && (
        <div className="mt-4">
          <UILabel>Предпросмотр QR кода</UILabel>
          <div className="mt-2 aspect-square w-32 rounded-lg border bg-muted">
            <img
              src={qrPreviewUrl}
              alt="QR код"
              className="h-full w-full object-contain p-2"
            />
          </div>
        </div>
      )}
    </Tabs>
  );
}