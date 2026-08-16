import { Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";

import { signupSchema, type SignupFormData } from "../schemas/signup.schema";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const { mutate, isPending } = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: SignupFormData) => {
    // Send only name, email, password to backend
    // confirmPassword is client-side validation only
    mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Create Account 🎉</h2>

        <p className="mt-2 text-slate-500">
          Join us to start managing your projects.
        </p>
      </div>

      <Input
        id="name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        leftIcon={<User size={18} />}
        error={errors.name?.message}
        autoComplete="name"
        disabled={isPending}
        {...register("name")}
      />

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

      <div className="relative">
        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          autoComplete="new-password"
          disabled={isPending}
          {...register("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-11 text-slate-500 hover:text-slate-700 text-sm font-medium disabled:opacity-50"
          disabled={isPending}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div className="relative">
        <Input
          id="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          leftIcon={<Lock size={18} />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          disabled={isPending}
          {...register("confirmPassword")}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-11 text-slate-500 hover:text-slate-700 text-sm font-medium disabled:opacity-50"
          disabled={isPending}
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
      </div>

      <Button
        type="submit"
        loading={isPending}
        disabled={isPending}
        className="w-full"
      >
        Create Account
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="font-medium text-blue-600 transition hover:text-blue-700"
            disabled={isPending}
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
}
