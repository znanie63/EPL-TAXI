import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeInput } from "@/components/drivers/qr-code-input";
import { QrCode } from "lucide-react";
import { storageService } from "@/lib/services/storage";

interface QRSectionProps {
  data: {
    qr_link?: string;
  };
  onChange: (data: any) => void;
}

export function QRSection({ data, onChange }: QRSectionProps) {
  const [qrFile, setQrFile] = useState<File | null>(null);

  const handleQRGenerated = (file: File | null) => {
    setQrFile(file);
  };

  // Expose QR file for form submission
  useEffect(() => {
    onChange({ ...data, _qrFile: qrFile });
  }, [qrFile]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <QrCode className="h-5 w-5" />
        QR код
      </h3>
      <div className="space-y-4">
        <QRCodeInput 
          onQRGenerated={handleQRGenerated}
          currentQrUrl={data.qr_link}
        />
      </div>
    </div>
  );
}