import { Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";

import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back 👋</h2>

        <p className="mt-2 text-slate-500">
          Sign in to continue managing your projects.
        </p>
      </div>

      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="john@example.com"
        leftIcon={<Mail size={18} />}
        error={errors.email?.message}
        autoComplete="email"
        disabled={isPending}
        {...register("email")}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock size={18} />}
        error={errors.password?.message}
        autoComplete="current-password"
        disabled={isPending}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="rounded border-slate-300"
            disabled={isPending}
          />
          Remember me
        </label>

        <a
          href="#"
          className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" loading={isPending} disabled={isPending}>
        Sign In
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/auth/signup")}
            className="font-medium text-blue-600 transition hover:text-blue-700"
            disabled={isPending}
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
}
