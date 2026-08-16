import HeroSection from "../components/HeroSection";
import AuthCard from "../components/AuthCard";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <HeroSection />

      <section className="flex items-center justify-center bg-slate-50 p-6">
        <AuthCard>
          <SignupForm />
        </AuthCard>
      </section>
    </div>
  );
}
