import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { TEAMS } from "@/lib/catalog";
import { TOOL_IDS, TOOL_META, VOICES, readiness, type ToolId } from "@/lib/domain";
import { useActiveAgent, useAtrium } from "@/lib/store";
import { Button, Field, TextArea, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";

const TEAM_LABELS = TEAMS.map((team) => team.label);

export function Designer() {
  const agent = useActiveAgent();
  const updateAgent = useAtrium((state) => state.updateAgent);
  const duplicateAgent = useAtrium((state) => state.duplicateAgent);
  const removeAgent = useAtrium((state) => state.removeAgent);
  const openAgent = useAtrium((state) => state.openAgent);
  const [confirm, setConfirm] = useState(false);

  if (!agent) return null;
  const active = agent;
  const status = readiness(active);
  const knownTeam = TEAM_LABELS.includes(agent.team);

  const toggleTool = (id: ToolId) => {
    const tools = agent.tools.includes(id) ? agent.tools.filter((tool) => tool !== id) : [...agent.tools, id];
    updateAgent(agent.id, { tools });
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-fg">Design</h1>
            <p className={cn("mt-2 text-sm", status.ready ? "text-ok" : "text-muted")}>{status.label}</p>
          </div>
          <Button variant="primary" onClick={() => openAgent(agent.id, "run")}>
            Run
          </Button>
        </div>

        <Field label="Name">
          <TextInput
            value={agent.name}
            maxLength={80}
            onChange={(event) => updateAgent(agent.id, { name: event.target.value })}
          />
        </Field>
        <Field label="Role" hint="One line">
          <TextInput
            value={agent.role}
            maxLength={120}
            onChange={(event) => updateAgent(agent.id, { role: event.target.value })}
          />
        </Field>
        <Field label="Team">
          <select
            value={knownTeam ? agent.team : "Custom"}
            onChange={(event) => updateAgent(agent.id, { team: event.target.value })}
            className="scheme-dark min-h-11 w-full rounded-control bg-surface px-3 text-sm text-fg shadow-ring outline-none"
          >
            {TEAM_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
            <option value="Custom">Custom</option>
          </select>
        </Field>
        {!knownTeam ? (
          <Field label="Team name">
            <TextInput
              value={agent.team}
              maxLength={40}
              onChange={(event) => updateAgent(agent.id, { team: event.target.value || "Custom" })}
            />
          </Field>
        ) : null}
        <Field label="Partners" hint="Who they hand work to">
          <TextInput
            value={agent.partners}
            maxLength={180}
            onChange={(event) => updateAgent(agent.id, { partners: event.target.value })}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-fg">Voice</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {VOICES.map((voice) => {
              const selected = agent.voice === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateAgent(agent.id, { voice: voice.id })}
                  className={cn(
                    "min-h-11 rounded-control px-3 text-sm shadow-ring",
                    selected ? "bg-accent text-accent-fg" : "bg-surface text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  {voice.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Temperature" hint={agent.temperature.toFixed(1)}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={agent.temperature}
            aria-valuetext={agent.temperature.toFixed(1)}
            onChange={(event) => updateAgent(agent.id, { temperature: Number(event.target.value) })}
            className="mt-2 w-full"
          />
          <p className="mt-2 text-xs text-subtle">Lower stays closer to the tools. Higher varies the wording.</p>
        </Field>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-fg">Tools on the desk</legend>
          <p className="mb-3 text-xs text-subtle">Only enabled tools are offered when this agent runs.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TOOL_IDS.map((id) => {
              const on = agent.tools.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTool(id)}
                  className={cn(
                    "min-h-11 rounded-control px-3 py-2 text-left shadow-ring",
                    on ? "bg-elevated text-fg shadow-ring-strong" : "bg-surface text-muted",
                  )}
                >
                  <span className="block text-sm font-medium">{TOOL_META[id].label}</span>
                  <span className="mt-1 block text-xs text-subtle">{TOOL_META[id].detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Instructions" hint="Saved on this device">
          <TextArea
            value={agent.instructions}
            maxLength={4000}
            onChange={(event) => updateAgent(agent.id, { instructions: event.target.value })}
          />
        </Field>

        <div className="flex flex-wrap gap-2 pb-4">
          <Button onClick={() => duplicateAgent(agent.id)}>
            <Copy className="size-4" aria-hidden />
            Duplicate
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!confirm) {
                setConfirm(true);
                return;
              }
              removeAgent(agent.id);
              setConfirm(false);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            {confirm ? "Confirm delete" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
