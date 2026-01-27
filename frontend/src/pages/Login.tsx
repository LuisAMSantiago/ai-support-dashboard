import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Mail, Lock, Loader2, User } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, isLoggingIn, isAuthenticated, isLoading } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/tickets" replace />;
  }

  const onLoginSubmit = (data: LoginFormData) => {
    login({ email: data.email, password: data.password });
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsRegistering(true);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      setIsRegisterMode(false);
      registerForm.reset();
    } catch (error: any) {
      const message = error.response?.data?.meta?.message || error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-sm border-border animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              AI Support Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {isRegisterMode 
                ? 'Crie sua conta para acessar o sistema'
                : 'Entre com suas credenciais para acessar o sistema'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isRegisterMode ? (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nome
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    {...registerForm.register('name')}
                    placeholder="Seu nome"
                    className="pl-10 bg-background border-border"
                    autoComplete="name"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    {...registerForm.register('email')}
                    placeholder="seu@email.com"
                    className="pl-10 bg-background border-border"
                    autoComplete="email"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    {...registerForm.register('password')}
                    placeholder="••••••••"
                    className="pl-10 bg-background border-border"
                    autoComplete="new-password"
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-foreground">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password_confirmation"
                    type="password"
                    {...registerForm.register('password_confirmation')}
                    placeholder="••••••••"
                    className="pl-10 bg-background border-border"
                    autoComplete="new-password"
                  />
                </div>
                {registerForm.formState.errors.password_confirmation && (
                  <p className="text-xs text-destructive">{registerForm.formState.errors.password_confirmation.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Já tem uma conta? <span className="text-primary font-medium">Entrar</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="seu@email.com"
                    className="pl-10 bg-background border-border"
                    autoComplete="email"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register('password')}
                    placeholder="••••••••"
                    className="pl-10 bg-background border-border"
                    autoComplete="current-password"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Não tem uma conta? <span className="text-primary font-medium">Cadastre-se</span>
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
