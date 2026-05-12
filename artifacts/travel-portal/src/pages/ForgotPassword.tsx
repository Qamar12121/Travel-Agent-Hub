import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForgotPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const mutation = useForgotPassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ data }, {
      onSuccess: () => setSent(true),
      onError: () => setSent(true),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-sidebar/10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription>Enter your email and we will send you a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                If that email exists in our system, a password reset link has been sent. Please check your inbox.
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-2">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} className="h-11" data-testid="input-email" />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full h-11 text-base" disabled={mutation.isPending} data-testid="button-send-reset">
                {mutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        {!sent && (
          <CardFooter className="flex justify-center border-t p-6">
            <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
