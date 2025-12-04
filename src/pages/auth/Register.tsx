import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, Lock, User, Building2, Phone, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';
import { pricingPlans } from '@/data/mockData';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Dados do Salão' },
  { id: 2, name: 'Dados Pessoais' },
  { id: 3, name: 'Escolha o Plano' },
  { id: 4, name: 'Configuração Inicial' },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 - Salon
    salonName: '',
    salonPhone: '',
    salonAddress: '',
    // Step 2 - Personal
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 3 - Plan
    selectedPlan: 'professional',
    // Step 4 - Initial Setup
    services: [] as string[],
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Função para traduzir mensagens de erro do Supabase
  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';

    // Traduzir mensagens comuns do Supabase
    if (errorMessage.includes('User already registered') || 
        errorMessage.includes('already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('already has a tenant')) {
      return 'Este email já está cadastrado. Faça login ao invés de criar uma nova conta.';
    }

    if (errorMessage.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (errorMessage.includes('Invalid email')) {
      return 'Email inválido. Verifique o formato do email e tente novamente.';
    }

    if (errorMessage.includes('Too many requests') || errorCode === 'too_many_requests') {
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    }

    if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    if (errorMessage.includes('function') || errorMessage.includes('does not exist')) {
      return 'Erro no servidor. Entre em contato com o suporte.';
    }

    // Se não for uma mensagem conhecida, usar mensagem genérica amigável
    return 'Não foi possível criar sua conta. Verifique os dados e tente novamente.';
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'As senhas devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        salonName: formData.salonName,
        salonPhone: formData.salonPhone,
        salonAddress: formData.salonAddress,
      });

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo ao BeautySaaS. Redirecionando...',
      });

      setSignUpSuccess(true);
      // O redirecionamento será feito pelo useEffect quando o profile carregar
    } catch (error: any) {
      const friendlyMessage = getErrorMessage(error);
      toast({
        title: 'Não foi possível criar sua conta',
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Redirecionar quando o profile carregar após signUp
  useEffect(() => {
    if (signUpSuccess && isAuthenticated && profile) {
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'professional') {
        navigate('/profissional', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [signUpSuccess, isAuthenticated, profile, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">BeautySaaS</span>
          </Link>
          <ThemeToggleSimple />
        </div>

        {/* Steps indicator */}
        <div className="max-w-2xl mx-auto w-full mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                      currentStep > step.id
                        ? 'bg-success text-success-foreground'
                        : currentStep === step.id
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span className={cn(
                    'text-xs mt-2 hidden sm:block',
                    currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'h-1 w-12 sm:w-24 mx-2 rounded',
                    currentStep > step.id ? 'bg-success' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Salão</CardTitle>
                  <CardDescription>
                    Informações básicas do seu estabelecimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="salonName">Nome do Salão</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="salonName"
                        placeholder="Studio Bella"
                        className="pl-10"
                        value={formData.salonName}
                        onChange={(e) => updateFormData('salonName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salonPhone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="salonPhone"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        value={formData.salonPhone}
                        onChange={(e) => updateFormData('salonPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salonAddress">Endereço</Label>
                    <Input
                      id="salonAddress"
                      placeholder="Rua das Flores, 123 - Centro"
                      value={formData.salonAddress}
                      onChange={(e) => updateFormData('salonAddress', e.target.value)}
                    />
                  </div>
                  <Button variant="gradient" className="w-full" onClick={handleNext}>
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Seus Dados</CardTitle>
                  <CardDescription>
                    Crie sua conta de administrador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    <Button variant="gradient" className="flex-1" onClick={handleNext}>
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Escolha seu Plano</CardTitle>
                  <CardDescription>
                    Comece com 14 dias grátis em qualquer plano
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {pricingPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={cn(
                          'p-4 rounded-xl border-2 cursor-pointer transition-all',
                          formData.selectedPlan === plan.id
                            ? 'border-primary bg-primary-light'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => updateFormData('selectedPlan', plan.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{plan.name}</h4>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold">R$ {plan.price}</span>
                            <span className="text-muted-foreground text-sm">/mês</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    <Button variant="gradient" className="flex-1" onClick={handleNext}>
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Configuração Inicial</CardTitle>
                  <CardDescription>
                    Configure os horários de funcionamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Horário de abertura</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.workingHours.start}
                        onChange={(e) => updateFormData('workingHours', {
                          ...formData.workingHours,
                          start: e.target.value,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Horário de fechamento</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.workingHours.end}
                        onChange={(e) => updateFormData('workingHours', {
                          ...formData.workingHours,
                          end: e.target.value,
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      Você poderá adicionar serviços, profissionais e personalizar 
                      mais configurações depois de criar sua conta.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    <Button
                      variant="gradient"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Criando conta...' : 'Criar conta'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-display font-bold mb-4">
            Comece sua jornada
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Junte-se a milhares de salões que já transformaram sua gestão com nossa plataforma.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <p>14 dias grátis</p>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <p>Sem cartão de crédito</p>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5" />
              <p>Suporte incluído</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
