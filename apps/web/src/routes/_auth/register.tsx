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

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
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
      router.navigate({ to: "/login" });
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "Registration failed. Try again." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="johndoe"
                  data-invalid={fieldState.invalid}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  This is your public display name.
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
            {isPending ? "Creating account..." : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
