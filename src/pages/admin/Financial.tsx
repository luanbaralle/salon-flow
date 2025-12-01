import { AdminHeader } from '@/components/layout/AdminHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { dashboardStats } from '@/data/mockData';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFinancial() {
  const { transactions } = useApp();

  return (
    <div className="min-h-screen">
      <AdminHeader title="Financeiro" subtitle="Controle de receitas e despesas" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Faturamento Mensal" value={`R$ ${dashboardStats.monthRevenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} variant="success" trend={{ value: 15, isPositive: true }} />
          <StatCard title="Faturamento Semanal" value={`R$ ${dashboardStats.weekRevenue.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} variant="primary" />
          <StatCard title="Ticket Médio" value="R$ 125" icon={<DollarSign className="h-5 w-5" />} variant="info" />
        </div>
        <Card>
          <CardHeader><CardTitle>Últimas Transações</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success-light' : 'bg-destructive/10'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="h-5 w-5 text-success" /> : <ArrowDownRight className="h-5 w-5 text-destructive" />}
                    </div>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(t.date), 'dd/MM/yyyy')} • {t.category}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'income' ? '+' : ''}R$ {Math.abs(t.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
