import { FolderKanban, Users, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 lg:flex flex-col justify-center p-16 text-white">
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10 max-w-lg">
        <h1 className="text-5xl font-bold">Task Manager</h1>

        <p className="mt-6 text-lg text-blue-100 leading-8">
          Organize your projects, collaborate with your team, and deliver faster
          than ever.
        </p>

        <div className="mt-10 space-y-5">
          <div className="flex items-center gap-3">
            <FolderKanban size={22} />
            <span>Unlimited Projects</span>
          </div>

          <div className="flex items-center gap-3">
            <Users size={22} />
            <span>Team Collaboration</span>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} />
            <span>Smart Task Tracking</span>
          </div>
        </div>

        <div className="mt-14 flex gap-10">
          <div>
            <h2 className="text-4xl font-bold">500+</h2>
            <p className="text-blue-100">Projects</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">1200+</h2>
            <p className="text-blue-100">Tasks</p>
          </div>
        </div>
      </div>
    </section>
  );
}
