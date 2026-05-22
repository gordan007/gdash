import { Link } from "react-router-dom";
import { useGdash } from "../context/GdashContext.js";
import { Card } from "../components/ui/Card.js";

export function ProjectsListPage() {
  const { data } = useGdash();
  return (
    <div className="space-y-4">
      {data.projects.map((p) => (
        <Link key={p.slug} to={`/projects/${p.slug}`}>
          <Card className="hover:shadow-md">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{p.stackType}</p>
              </div>
              <span className="text-sm text-[var(--text-muted)]">{p.slug}</span>
            </div>
          </Card>
        </Link>
      ))}
      {data.projects.length === 0 && (
        <p className="text-[var(--text-secondary)]">No projects yet. Create one from the sidebar.</p>
      )}
    </div>
  );
}
