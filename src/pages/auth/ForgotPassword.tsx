import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggleSimple } from '@/components/ui/theme-toggle';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSent(true);
    toast({
      title: 'Email enviado!',
      description: 'Verifique sua caixa de entrada.',
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">BeautySaaS</span>
          </Link>
          <ThemeToggleSimple />
        </div>

        <Card>
          {!sent ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Recuperar senha</CardTitle>
                <CardDescription>
                  Digite seu email para receber as instruções
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar instruções'}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success-light flex items-center justify-center">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-2xl">Email enviado!</CardTitle>
                <CardDescription>
                  Enviamos as instruções para <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </>
          )}
          <CardFooter className="justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
