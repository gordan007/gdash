import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadProjectCosts, type ProjectCosts } from "@gdash/core";
import { useGdash, useProject } from "../context/GdashContext.js";
import { ProjectCostsView } from "../components/costs/CostViews.js";
import { fetchServicesDoc } from "../lib/fetch-doc.js";

export function ProjectCostsPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = useProject(slug);
  const { getCache } = useGdash();
  const [costs, setCosts] = useState<ProjectCosts | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!project) return;
    const cached = slug ? getCache(slug)?.costs : undefined;
    if (cached) setCosts(cached);
    void loadProjectCosts(project, fetchServicesDoc)
      .then(setCosts)
      .catch(() => setError(true));
  }, [project, slug, getCache]);

  if (!project) return <p className="text-[var(--text-secondary)]">Project not found.</p>;
  if (error && !costs) {
    return (
      <p className="text-[var(--text-secondary)]">
        Could not load SERVICES doc. Check the path in{" "}
        <a href={`#/projects/${slug}/settings`} className="underline">
          project settings
        </a>
        .
      </p>
    );
  }
  if (!costs) return <p className="text-[var(--text-secondary)]">Loading costs…</p>;

  return <ProjectCostsView project={project} costs={costs} />;
}
