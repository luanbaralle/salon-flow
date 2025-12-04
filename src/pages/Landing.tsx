import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  BarChart3,
  Clock,
  Bell,
  Smartphone,
  Shield,
  Zap,
  Star,
  Check,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Play,
} from 'lucide-react';
import { pricingPlans } from '@/data/mockData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Gerencie todos os agendamentos em um só lugar com visualização por dia, semana ou mês.',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Mantenha o histórico completo de cada cliente e aumente a fidelização.',
  },
  {
    icon: Bell,
    title: 'Lembretes Automáticos',
    description: 'Reduza faltas com notificações automáticas via WhatsApp e SMS.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description: 'Acompanhe o desempenho do seu salão com relatórios completos.',
  },
  {
    icon: Smartphone,
    title: 'Agendamento Online',
    description: 'Seus clientes podem agendar 24h por dia pelo celular.',
  },
  {
    icon: Shield,
    title: 'Dados Seguros',
    description: 'Seus dados e de seus clientes protegidos com a melhor segurança.',
  },
];

const steps = [
  { number: '01', title: 'Crie sua conta', description: 'Cadastre seu salão em menos de 5 minutos' },
  { number: '02', title: 'Configure seu negócio', description: 'Adicione serviços, profissionais e horários' },
  { number: '03', title: 'Compartilhe o link', description: 'Envie o link de agendamento para seus clientes' },
  { number: '04', title: 'Gerencie tudo', description: 'Acompanhe agendamentos e cresça seu negócio' },
];

const faqs = [
  {
    question: 'Como funciona o período de teste?',
    answer: 'Você pode testar todas as funcionalidades por 14 dias gratuitamente, sem precisar de cartão de crédito. Após esse período, escolha o plano que melhor se adapta ao seu negócio.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento e seus dados ficarão disponíveis até o final do período pago.',
  },
  {
    question: 'O sistema funciona em celular?',
    answer: 'Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente em smartphones, tablets e computadores.',
  },
  {
    question: 'Como meus clientes fazem agendamentos?',
    answer: 'Você recebe um link exclusivo do seu salão que pode compartilhar com seus clientes. Eles acessam pelo celular, escolhem o serviço, profissional e horário disponível.',
  },
  {
    question: 'Preciso de conhecimento técnico?',
    answer: 'Não! O sistema foi desenvolvido para ser simples e intuitivo. Qualquer pessoa consegue usar em poucos minutos.',
  },
  {
    question: 'Vocês oferecem suporte?',
    answer: 'Sim! Oferecemos suporte por chat, email e telefone. Nos planos Profissional e Enterprise, o suporte é prioritário.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">BeautySaaS</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Como funciona
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggleSimple />
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button variant="gradient" onClick={() => navigate('/cadastro')}>
                Começar grátis
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggleSimple />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <a href="#features" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                Funcionalidades
              </a>
              <a href="#how-it-works" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                Como funciona
              </a>
              <a href="#pricing" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                Preços
              </a>
              <a href="#faq" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                FAQ
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button variant="gradient" onClick={() => navigate('/cadastro')}>
                  Começar grátis
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="soft-primary" className="mb-6 px-4 py-1.5">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                +5.000 salões já usam
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6"
            >
              Simplifique a gestão do seu{' '}
              <span className="text-gradient">salão de beleza</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Agenda online, gestão de clientes, controle financeiro e muito mais. 
              Tudo que você precisa para fazer seu salão crescer.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate('/cadastro')}
                className="w-full sm:w-auto"
              >
                Teste grátis por 14 dias
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto gap-2"
                onClick={() => navigate('/demo')}
              >
                <Play className="h-4 w-4" />
                Ver demonstração
              </Button>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="text-sm text-muted-foreground mt-4"
            >
              Sem necessidade de cartão de crédito
            </motion.p>
          </motion.div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl border bg-card p-2 shadow-2xl">
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
                <img 
                  src="/dashboard-preview.png.png" 
                  alt="Preview do Dashboard - Studio Bella"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -left-6 top-1/4 animate-float">
                <Card className="shadow-lg">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-success-light flex items-center justify-center">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Novo agendamento</p>
                      <p className="text-[10px] text-muted-foreground">Maria Silva - 14:00</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="absolute -right-6 bottom-1/3 animate-float" style={{ animationDelay: '2s' }}>
                <Card className="shadow-lg">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-warning-light flex items-center justify-center">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">4.9 de avaliação</p>
                      <p className="text-[10px] text-muted-foreground">127 avaliações</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="soft-primary" className="mb-4">Funcionalidades</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Tudo que seu salão precisa
            </h2>
            <p className="text-muted-foreground">
              Ferramentas poderosas e fáceis de usar para transformar a gestão do seu negócio
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="soft-primary" className="mb-4">Como funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Comece em 4 passos simples
            </h2>
            <p className="text-muted-foreground">
              Configure seu salão em minutos e comece a receber agendamentos online
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="text-6xl font-display font-bold text-primary/10 mb-2">
                  {step.number}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ChevronRight className="h-6 w-6 text-primary/30 -translate-x-1/2" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="soft-primary" className="mb-4">Preços</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-muted-foreground">
              Escolha o plano ideal para o seu negócio. Cancele quando quiser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${plan.popular ? 'ring-2 ring-primary shadow-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="gradient-primary">Mais popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="text-4xl font-display font-bold">
                        R$ {plan.price}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-5 w-5 text-success shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <X className="h-5 w-5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'gradient' : 'outline'}
                      onClick={() => navigate('/cadastro')}
                    >
                      Começar agora
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="soft-primary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre o sistema
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-xl px-6 bg-card"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-3xl gradient-hero p-12 md:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                  Pronto para transformar seu salão?
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                  Junte-se a mais de 5.000 salões que já simplificaram sua gestão com nossa plataforma.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="xl"
                    variant="secondary"
                    className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90"
                    onClick={() => navigate('/cadastro')}
                  >
                    Criar conta grátis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto bg-white text-foreground border-border hover:bg-transparent hover:text-white rounded-lg transition-all duration-200"
                  >
                    Falar com vendas
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">BeautySaaS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BeautySaaS. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
