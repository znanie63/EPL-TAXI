/**
 * Personal information form section component
 */
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Lock } from "lucide-react";
import { usePhoneMask } from "@/hooks/use-phone-mask";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

interface PersonalInfoSectionProps {
  data: {
    display_name: string;
    phone_number: string;
    email: string;
    password?: string;
  };
  mode: 'create' | 'edit';
  onChange: (data: any) => void;
}

export function PersonalInfoSection({ data, mode, onChange }: PersonalInfoSectionProps) {
  const phone = usePhoneMask(data.phone_number);
  const { toast } = useToast();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({
        title: "Письмо отправлено",
        description: "Инструкции по сбросу пароля отправлены на почту",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить письмо для сброса пароля",
        variant: "destructive",
      });
    }
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Неверный формат email');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string) => {
    if (!/^\d{6}$/.test(password)) {
      setPasswordError('Пароль должен состоять из 6 цифр');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    onChange({ ...data, email });
    validateEmail(email);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    onChange({ ...data, password });
    validatePassword(password);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <User className="h-5 w-5" />
        Личные данные
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name" className="flex items-center gap-2">
            <User className="h-4 w-4" /> ФИО
          </Label>
          <Input
            id="display_name"
            value={data.display_name}
            onChange={(e) =>
              onChange({ ...data, display_name: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Телефон
            </Label>
            <Input
              id="phone_number"
              value={phone.value}
              onChange={(e) => {
                phone.onChange(e);
                onChange({ ...data, phone_number: e.target.value })
              }}
              placeholder="+7 (999) 999-99-99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </Label>
            <div>
              {mode === 'create' ? (
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={handleEmailChange}
                required
              />
              ) : (
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  disabled
                  className="bg-muted"
                />
              )}
              {mode === 'create' && emailError && (
                <div className="text-sm text-destructive mt-1">
                  {emailError}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {mode === 'create' ? (
              <>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="Введите 6 цифр"
                  value={data.password || ''}
                  onChange={handlePasswordChange}
                  required
                />
                {passwordError && (
                  <div className="text-sm text-destructive mt-1">
                    {passwordError}
                  </div>
                )}
              </>
            ) : (
              <>
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Пароль
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetPassword}
                  className="w-full"
                >
                  Сбросить пароль
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}