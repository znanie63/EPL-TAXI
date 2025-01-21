import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Clear error when inputs change
    setError(null);
    setIsDriver(false);
  }, [email, password]);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Ошибка",
        description: "Введите email для восстановления пароля",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Письмо отправлено",
        description: "Проверьте вашу почту для восстановления пароля",
      });
      setResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить письмо для восстановления пароля",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (error) {
      if (error.message === 'Drivers not allowed') {
        setIsDriver(true);
        return;
      }
      
      let message = "Произошла ошибка при входе";
      if (error.code === "auth/invalid-email") {
        message = "Неверный формат email";
      } else if (error.code === "auth/user-not-found") {
        message = "Пользователь не найден";
      } else if (error.code === "auth/wrong-password") {
        message = "Неверный пароль";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Добро пожаловать
          </h1>
          <p className="text-muted-foreground">
            Войдите в систему для продолжения
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isDriver && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    Водители не могут зайти в админ панель
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-normal"
                  >
                    Забыли пароль?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Восстановление пароля</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">
                        Введите email для восстановления пароля
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="example@mail.com"
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setResetDialogOpen(false)}
                        disabled={resetLoading}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Отправка...
                          </>
                        ) : (
                          "Отправить"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}