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

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
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
      router.navigate({ to: "/" });
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "Invalid email or password" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
