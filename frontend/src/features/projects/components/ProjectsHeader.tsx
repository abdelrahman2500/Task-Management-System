import { Button } from "../../../shared/components/ui/Button";

interface Props {
  onCreate: () => void;
}

export default function ProjectsHeader({ onCreate }: Props) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>

        <p className="text-slate-500">Manage all your projects.</p>
      </div>

      <Button className="w-auto" onClick={onCreate}>
        New Project
      </Button>
    </div>
  );
}
