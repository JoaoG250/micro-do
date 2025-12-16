import * as React from "react";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label ref={ref} className={className} {...props} />
));
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground text-[0.8rem]", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  errors?: React.ReactNode[] | any[];
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, errors, children, ...props }, ref) => {
    if ((!errors || errors.length === 0) && !children) {
      return null;
    }

    const message = children || errors?.[0]?.message?.toString();

    if (!message) {
      return null;
    }

    return (
      <p
        ref={ref}
        className={cn("text-destructive text-[0.8rem] font-medium", className)}
        {...props}
      >
        {message}
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

export { Field, FieldLabel, FieldDescription, FieldError };
