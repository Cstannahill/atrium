import { useState } from "react";
import { extraHeaders, isBrowserDirect, parseModelIds, PROVIDER_IDS, type ProviderConfig } from "@/lib/providers";
import { listProviderModels } from "@/lib/run-agent";
import { runCompletion, todayStamp } from "@/lib/run-step";
import { useAtrium } from "@/lib/store";
import { Button, Field, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";

export function Models() {
  const providers = useAtrium((state) => state.providers);
  const activeId = useAtrium((state) => state.activeProvider);
  const setActiveProvider = useAtrium((state) => state.setActiveProvider);
  const updateProvider = useAtrium((state) => state.updateProvider);
  const provider = providers[activeId];
  const [busy, setBusy] = useState<"test" | "list" | null>(null);
  const [notice, setNotice] = useState("");
  const [models, setModels] = useState<string[]>([]);

  const patch = (next: Partial<ProviderConfig>) => updateProvider(provider.id, next);

  const test = async () => {
    setBusy("test");
    setNotice("");
    const result = await runCompletion({
      provider,
      today: todayStamp(),
      maxTokens: 24,
      agent: {
        name: "Atrium",
        role: "Connection check",
        instructions: "Reply with exactly the word ready.",
        voice: "terse",
        tools: [],
        temperature: 0,
        team: "Custom",
        partners: "",
      },
      messages: [{ role: "user", content: "Reply with exactly: ready" }],
    });
    setBusy(null);
    setNotice(result.ok ? `Connected. ${result.message.content.trim() || "Empty reply."}` : result.error);
  };

  const list = async () => {
    setBusy("list");
    setNotice("");
    setModels([]);
    if (isBrowserDirect(provider)) {
      const root = provider.baseUrl.trim().replace(/\/+$/, "");
      const url = root.endsWith("/models") ? root : `${root}/models`;
      try {
        const response = await fetch(url, {
          headers: {
            ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
            ...extraHeaders(provider.id, provider.baseUrl),
          },
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) {
          setNotice("That server did not return a model list. Type the model name.");
        } else {
          const found = parseModelIds(await response.json());
          setModels(found);
          setNotice(found.length ? "" : "No model ids came back. Type one in the model field.");
        }
      } catch {
        setNotice("The browser could not list models. Check the URL, CORS, and the tunnel.");
      }
      setBusy(null);
      return;
    }
    const result = await listProviderModels({
      data: {
        id: provider.id,
        baseUrl: provider.baseUrl,
        ...(provider.apiKey ? { apiKey: provider.apiKey } : {}),
        usePlatformKey: provider.usePlatformKey,
      },
    });
    setBusy(null);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setModels(result.models);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5">
        <div>
          <h1 className="font-display text-3xl text-fg">Models</h1>
          <p className="mt-2 text-sm text-muted">
            Every run uses one OpenAI-compatible endpoint. Keys stay on this device. Atrium does not start tunnels.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Provider">
          {PROVIDER_IDS.map((id) => {
            const item = providers[id];
            const selected = id === activeId;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveProvider(id);
                  setNotice("");
                  setModels([]);
                }}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-3 text-sm shadow-ring",
                  selected ? "bg-accent text-accent-fg" : "bg-surface text-muted",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted">{provider.note}</p>

        {provider.id === "xai" ? (
          <button
            type="button"
            aria-pressed={provider.usePlatformKey}
            onClick={() => patch({ usePlatformKey: !provider.usePlatformKey })}
            className={cn(
              "min-h-11 rounded-control px-3 text-left text-sm shadow-ring",
              provider.usePlatformKey ? "bg-elevated text-fg shadow-ring-strong" : "bg-surface text-muted",
            )}
          >
            Use the included Grok key
            <span className="mt-1 block text-xs text-subtle">
              It may already be out of credits. Turn this off and paste your own key, or pick another provider.
            </span>
          </button>
        ) : null}

        {provider.local ? (
          <div className="space-y-3">
            <button
              type="button"
              aria-pressed={provider.tunnel}
              onClick={() => patch({ tunnel: !provider.tunnel })}
              className={cn(
                "min-h-11 w-full rounded-control px-3 text-left text-sm shadow-ring",
                provider.tunnel ? "bg-elevated text-fg shadow-ring-strong" : "bg-surface text-muted",
              )}
            >
              Use a tunnel
              <span className="mt-1 block text-xs text-subtle">
                Off calls this browser’s localhost. On calls the https address you paste. Atrium never opens Cloudflare or ngrok for you.
              </span>
            </button>
            <p className="text-xs text-subtle">
              Point cloudflared or ngrok at the local port, then paste that public https URL. Ollama needs OLLAMA_ORIGINS. llama-server needs CORS. Leave the model field as the name that server already loaded.
            </p>
          </div>
        ) : null}

        <Field label="Base URL" hint={provider.tunnel ? "https tunnel" : provider.local ? "On your machine" : "https"}>
          <TextInput
            value={provider.baseUrl}
            maxLength={300}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            onChange={(event) => patch({ baseUrl: event.target.value })}
          />
        </Field>
        <Field label="Model">
          <TextInput
            value={provider.model}
            maxLength={120}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            onChange={(event) => patch({ model: event.target.value })}
          />
        </Field>
        <Field label="API key" hint="Stored on this device">
          <TextInput
            type="password"
            value={provider.apiKey}
            maxLength={500}
            autoComplete="off"
            placeholder={provider.local ? "Usually blank" : "Paste a key"}
            onChange={(event) => patch({ apiKey: event.target.value })}
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={busy !== null} onClick={() => void test()}>
            {busy === "test" ? "Testing" : "Test connection"}
          </Button>
          <Button disabled={busy !== null} onClick={() => void list()}>
            {busy === "list" ? "Listing" : "List models"}
          </Button>
        </div>
        {notice ? (
          <p className="text-sm text-muted" aria-live="polite">
            {notice}
          </p>
        ) : null}
        {models.length ? (
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto scrollbar-thin">
            {models.map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => patch({ model })}
                className={cn(
                  "min-h-11 rounded-full px-3 text-sm shadow-ring",
                  model === provider.model ? "bg-accent text-accent-fg" : "bg-surface text-fg",
                )}
              >
                {model}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
