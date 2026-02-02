import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from 'next-themes';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserTheme } from '@/types/user';

import authService from '@/services/auth.service';

const profileSchema = z.object({
  fullName: z.string().min(2, 'El nombre completo es requerido'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  theme: z.enum([UserTheme.LIGHT, UserTheme.DARK, UserTheme.SYSTEM]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      theme: (user?.preferences?.theme ?? (currentTheme ?? UserTheme.SYSTEM)) as UserTheme,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    form.reset({
      fullName: user.fullName,
      email: user.email,
      theme: (user.preferences?.theme ?? (currentTheme ?? UserTheme.SYSTEM)) as UserTheme,
    });
  }, [currentTheme, form, user]);

  const onSubmit = async (data: ProfileFormValues) => {
    setError(null);
    const success = await updateProfile({
      fullName: data.fullName,
      email: data.email,
      preferences: { theme: data.theme },
    });

    if (success) {
      setTheme(data.theme);
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios se guardaron correctamente.',
      });
    } else {
      setError('No se pudo actualizar el perfil. Inténtalo de nuevo.');
    }
  };

  const onSubmitPassword = async (data: PasswordFormValues) => {
    setPasswordError(null);
    if (!user?._id) {
      setPasswordError('No se pudo identificar tu usuario.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      passwordForm.reset();
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña fue cambiada correctamente.',
      });
    } catch {
      setPasswordError('No se pudo actualizar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Mi Perfil</h2>
          <p className="text-muted-foreground mt-1">
            Actualiza tu nombre, correo y el tema de la aplicación
          </p>
        </div>

        <div className="flex justify-center">
          <Tabs defaultValue="account" className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Cuenta</TabsTrigger>
              <TabsTrigger value="password">Contraseña</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la cuenta</CardTitle>
                  <CardDescription>
                    Estos cambios se verán reflejados en tu sesión
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="Tu nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tema</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un tema" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={UserTheme.LIGHT}>Claro</SelectItem>
                                <SelectItem value={UserTheme.DARK}>Oscuro</SelectItem>
                                <SelectItem value={UserTheme.SYSTEM}>Sistema</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            'Guardar cambios'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar contraseña</CardTitle>
                  <CardDescription>
                    Ingresa tu contraseña actual y una nueva
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                      {passwordError && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña actual</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  className="pr-10"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nueva contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  className="pr-10"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword((prev) => !prev)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSavingPassword}>
                          {isSavingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            'Actualizar contraseña'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
