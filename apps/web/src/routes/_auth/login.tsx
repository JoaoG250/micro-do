import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { useLoginMutation } from "@/hooks/mutations/auth.mutations";
import { loginSchema, type LoginSchema } from "@/validation/schemas";
import { useAuthStore } from "@/stores/auth.store";

import { z } from "zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: (search) => searchSchema.parse(search),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const login = useAuthStore((state) => state.login);
  const { mutateAsync: loginUser, isPending } = useLoginMutation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchema) {
    try {
      const data = await loginUser(values);
      login(data.accessToken);
      router.navigate({ to: search.redirect || "/" });
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "E-mail ou senha inválidos" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Digite seu e-mail abaixo para entrar na sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="m@example.com"
                  data-invalid={fieldState.invalid}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                <Input
                  {...field}
                  type="password"
                  id={field.name}
                  data-invalid={fieldState.invalid}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {form.formState.errors.root && (
            <div className="text-red-500 text-sm font-medium">
              {form.formState.errors.root.message}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            to="/register"
            search={{ redirect: search.redirect }}
            className="underline underline-offset-4 hover:text-primary"
          >
            Cadastrar-se
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
