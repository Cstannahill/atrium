import { useEffect } from "react";
import { LayoutGrid, Library, MessageSquare, PenLine } from "lucide-react";
import { Designer } from "@/components/designer";
import { Desk } from "@/components/desk";
import { Library as AgentLibrary } from "@/components/library";
import { Models } from "@/components/models";
import { Playground } from "@/components/playground";
import { cn } from "@/lib/cn";
import { useActiveAgent, useAtrium, type Pane } from "@/lib/store";

const NAV: { id: Pane; label: string; icon: typeof Library }[] = [
  { id: "library", label: "Agents", icon: Library },
  { id: "design", label: "Design", icon: PenLine },
  { id: "run", label: "Playground", icon: MessageSquare },
  { id: "desk", label: "Desk", icon: LayoutGrid },
];

export function Atrium() {
  useEffect(() => {
    void useAtrium.persist.rehydrate();
  }, []);

  const pane = useAtrium((state) => state.mobilePane);
  const mode = useAtrium((state) => state.desktopMode);
  const setPane = useAtrium((state) => state.setMobilePane);
  const setMode = useAtrium((state) => state.setDesktopMode);
  const modelsOpen = useAtrium((state) => state.modelsOpen);
  const setModelsOpen = useAtrium((state) => state.setModelsOpen);
  const providerLabel = useAtrium((state) => state.providers[state.activeProvider].label);
  const agent = useActiveAgent();
  const paneLabel = modelsOpen ? "Models" : NAV.find((item) => item.id === pane)?.label;

  return (
    <div className="flex h-dvh flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-line px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 bg-accent" aria-hidden />
          <p className="font-display text-xl italic leading-tight text-fg">Atrium</p>
        </div>
        <p className="truncate text-sm text-muted lg:hidden">{paneLabel}</p>
        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <button
            type="button"
            aria-pressed={modelsOpen}
            onClick={() => setModelsOpen(!modelsOpen)}
            className={cn(
              "min-h-11 max-w-28 truncate rounded-full px-3 text-sm sm:max-w-40",
              modelsOpen ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-ring",
            )}
          >
            <span className="sm:hidden">Models</span>
            <span className="hidden sm:inline">{providerLabel}</span>
          </button>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex rounded-card bg-surface p-1 shadow-ring">
              <button
                type="button"
                onClick={() => setMode("design")}
                className={cn(
                  "min-h-11 rounded-2xl px-3 text-sm",
                  !modelsOpen && mode === "design" ? "bg-elevated text-fg" : "text-muted",
                )}
              >
                Design
              </button>
              <button
                type="button"
                onClick={() => setMode("run")}
                className={cn(
                  "min-h-11 rounded-2xl px-3 text-sm",
                  !modelsOpen && mode === "run" ? "bg-elevated text-fg" : "text-muted",
                )}
              >
                Playground
              </button>
            </div>
            <p className="max-w-40 truncate text-sm text-muted">{agent?.name}</p>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_360px]">
        <section className={paneClass(!modelsOpen && pane === "library", true)} aria-label="Agents">
          <AgentLibrary />
        </section>
        <section className={paneClass(modelsOpen, modelsOpen)} aria-label="Models">
          <Models />
        </section>
        <section
          className={paneClass(!modelsOpen && pane === "design", !modelsOpen && mode === "design")}
          aria-label="Design"
        >
          <Designer />
        </section>
        <section className={paneClass(!modelsOpen && pane === "run", !modelsOpen && mode === "run")} aria-label="Playground">
          <Playground />
        </section>
        <section className={paneClass(!modelsOpen && pane === "desk", true)} aria-label="Desk">
          <Desk />
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = !modelsOpen && pane === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPane(item.id)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function paneClass(showOnMobile: boolean, showOnDesktop: boolean) {
  return cn(
    "h-full min-h-0 flex-col overflow-hidden",
    showOnMobile && showOnDesktop && "flex",
    !showOnMobile && showOnDesktop && "hidden lg:flex",
    showOnMobile && !showOnDesktop && "flex lg:hidden",
    !showOnMobile && !showOnDesktop && "hidden",
  );
}
