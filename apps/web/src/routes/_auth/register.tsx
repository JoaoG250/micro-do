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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@repo/ui/components/field";
import { useRegisterMutation } from "@/hooks/mutations/auth.mutations";
import { registerSchema, type RegisterSchema } from "@/validation/schemas";

import { z } from "zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/register")({
  validateSearch: (search) => searchSchema.parse(search),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const { mutateAsync: registerUser, isPending } = useRegisterMutation();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterSchema) {
    try {
      await registerUser(values);
      router.navigate({ to: "/login", search: { redirect: search.redirect } });
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "Falha no cadastro. Tente novamente." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar-se</CardTitle>
        <CardDescription>Criar uma nova conta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Nome de usuário</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="johndoe"
                  data-invalid={fieldState.invalid}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Este é o seu nome de exibição público.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
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
            {isPending ? "Criando conta..." : "Cadastrar-se"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            search={{ redirect: search.redirect }}
            className="underline underline-offset-4 hover:text-primary"
          >
            Entrar
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
