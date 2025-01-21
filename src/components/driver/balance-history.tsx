import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CreditCard } from "lucide-react";
import { ExportBalanceDialog } from "./export-balance-dialog";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

interface BalanceHistoryProps {
  driverId: string;
}

interface BalanceRecord {
  id: string;
  amount: number;
  type: 'topup' | 'charge';
  payment_type: 'cash' | 'card';
  created_time: any;
  description?: string;
}

export function BalanceHistory({ driverId }: BalanceHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<BalanceRecord[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    cash: 0,
    card: 0
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'balance_history'),
          where('driver_id', '==', driverId),
          orderBy('created_time', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BalanceRecord[];
        
        setHistory(records);
        
        // Calculate totals
        const income = records
          .filter(r => r.type === 'topup')
          .reduce((sum, r) => sum + r.amount, 0);
        
        const cashIncome = records
          .filter(r => r.type === 'topup' && r.payment_type === 'cash')
          .reduce((sum, r) => sum + r.amount, 0);
        
        const cardIncome = records
          .filter(r => r.type === 'topup' && r.payment_type === 'card')
          .reduce((sum, r) => sum + r.amount, 0);
        
        const expenses = records
          .filter(r => r.type === 'charge')
          .reduce((sum, r) => sum + r.amount, 0);
        
        setTotalIncome(income);
        setPaymentBreakdown({
          cash: cashIncome,
          card: cardIncome
        });
        setTotalExpenses(expenses);
        
      } catch (error) {
        console.error('Failed to fetch balance history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [driverId]);

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <ExportBalanceDialog history={history} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="p-2">
              <div className="text-xs font-medium text-muted-foreground">
                Пополнения за все время
              </div>
              <div className="text-lg font-bold mt-1 text-success">
                {totalIncome.toLocaleString('ru-RU')} ₽
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Wallet className="h-3 w-3" />
                    <span>Наличными:</span>
                  </div>
                  <span className="font-medium">{paymentBreakdown.cash.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span>Картой:</span>
                  </div>
                  <span className="font-medium">{paymentBreakdown.card.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-2">
              <div className="text-xs font-medium text-muted-foreground">
                Расход за все время
              </div>
              <div className="text-lg font-bold mt-1 text-destructive">
                {totalExpenses.toLocaleString('ru-RU')} ₽
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Способ оплаты</TableHead>
              <TableHead className="hidden md:table-cell">Описание</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Нет записей
                </TableCell>
              </TableRow>
            ) : (
              history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(record.created_time.toDate(), "dd.MM.yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {record.type === 'topup' ? (
                      <span className="text-success">Пополнение</span>
                    ) : (
                      <span className="text-destructive">Списание</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.type === 'topup' && (
                      <Badge variant="outline" className="gap-2">
                        {record.payment_type === 'cash' ? (
                          <>
                            <Wallet className="h-3 w-3" />
                            Наличными
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3 w-3" />
                            Картой
                          </>
                        )}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{record.description || '—'}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={record.type === 'topup' ? 'text-success' : 'text-destructive'}>
                      {record.type === 'topup' ? '+' : '−'} {Math.abs(record.amount)} ₽
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
       </div>
      </div>
    </div>
  );
}