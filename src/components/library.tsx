import { useMemo, useState } from "react";
import { Copy, PenLine, Play, Plus, Trash2 } from "lucide-react";
import { TEAMS } from "@/lib/catalog";
import { readiness, toolSummary, type Agent } from "@/lib/domain";
import { useAtrium } from "@/lib/store";
import { Button, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";

export function Library() {
  const agents = useAtrium((state) => state.agents);
  const activeId = useAtrium((state) => state.activeId);
  const addAgent = useAtrium((state) => state.addAgent);
  const openAgent = useAtrium((state) => state.openAgent);
  const duplicateAgent = useAtrium((state) => state.duplicateAgent);
  const removeAgent = useAtrium((state) => state.removeAgent);
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("All");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return agents.filter((agent) => {
      if (team !== "All" && agent.team !== team) return false;
      if (!needle) return true;
      return `${agent.name} ${agent.role} ${agent.team} ${agent.partners}`.toLowerCase().includes(needle);
    });
  }, [agents, query, team]);

  const groups = useMemo(() => {
    const known = TEAMS.map((item) => item.label);
    const ordered = [
      ...TEAMS.map((item) => ({
        label: item.label,
        blurb: item.blurb,
        agents: visible.filter((agent) => agent.team === item.label).sort((a, b) => a.name.localeCompare(b.name)),
      })),
      {
        label: "Custom",
        blurb: "Agents you added, outside the starter teams.",
        agents: visible
          .filter((agent) => !known.includes(agent.team))
          .sort((a, b) => a.name.localeCompare(b.name)),
      },
    ];
    return ordered.filter((group) => group.agents.length > 0);
  }, [visible]);

  const chips = ["All", ...TEAMS.map((item) => item.label), "Custom"];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 px-4 py-5">
        <div>
          <h1 className="font-display text-3xl text-fg">Agents</h1>
          <p className="mt-2 text-sm text-muted">
            Twelve teams share one desk. Leave notes, files, and drafts for the next person. Each agent keeps its own thread.
          </p>
        </div>
        <Button variant="primary" className="w-full" onClick={addAgent}>
          <Plus className="size-4" aria-hidden />
          New agent
        </Button>
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a name, role, or team"
          aria-label="Find an agent"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" aria-label="Teams">
          {chips.map((label) => {
            const count =
              label === "All"
                ? agents.length
                : agents.filter((agent) => (label === "Custom" ? !TEAMS.some((item) => item.label === agent.team) : agent.team === label))
                    .length;
            if (label !== "All" && count === 0) return null;
            const selected = team === label;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={selected}
                onClick={() => setTeam(label)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-3 text-sm shadow-ring",
                  selected ? "bg-accent text-accent-fg" : "bg-surface text-muted",
                )}
              >
                {label}
                <span className="ml-1 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-6 scrollbar-thin">
        {groups.length === 0 ? <p className="px-1 text-sm text-muted">No agent matches that.</p> : null}
        {groups.map((group) => (
          <section key={group.label} className="space-y-3">
            <div>
              <h2 className="font-display text-xl text-fg">{group.label}</h2>
              <p className="text-xs text-subtle">{group.blurb}</p>
            </div>
            {group.agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                active={agent.id === activeId}
                confirm={confirmId === agent.id}
                onOpen={(dest) => openAgent(agent.id, dest)}
                onDuplicate={() => duplicateAgent(agent.id)}
                onDelete={() => {
                  if (confirmId === agent.id) {
                    removeAgent(agent.id);
                    setConfirmId(null);
                  } else {
                    setConfirmId(agent.id);
                  }
                }}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  active,
  confirm,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  agent: Agent;
  active: boolean;
  confirm: boolean;
  onOpen: (dest: "run" | "design") => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const status = readiness(agent);
  return (
    <article className={cn("rounded-3xl bg-surface p-3 shadow-ring", active && "shadow-ring-strong")}>
      <button type="button" className="w-full text-left" onClick={() => onOpen("run")}>
        <p className="text-xs text-subtle">{agent.team}</p>
        <h3 className="font-display text-2xl text-fg">{agent.name}</h3>
        <p className="mt-1 text-sm text-muted">{agent.role}</p>
        <p className="mt-3 text-xs text-subtle">{toolSummary(agent.tools)}</p>
        <p className={cn("mt-2 text-xs", status.ready ? "text-ok" : "text-muted")}>{status.label}</p>
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="primary" onClick={() => onOpen("run")}>
          <Play className="size-4" aria-hidden />
          Run
        </Button>
        <Button size="sm" onClick={() => onOpen("design")}>
          <PenLine className="size-4" aria-hidden />
          Design
        </Button>
        <Button size="sm" variant="ghost" aria-label={`Duplicate ${agent.name}`} onClick={onDuplicate}>
          <Copy className="size-4" aria-hidden />
        </Button>
        <Button
          size="sm"
          variant="danger"
          aria-label={confirm ? `Confirm delete ${agent.name}` : `Delete ${agent.name}`}
          onClick={onDelete}
        >
          <Trash2 className="size-4" aria-hidden />
          {confirm ? "Confirm" : ""}
        </Button>
      </div>
    </article>
  );
}
