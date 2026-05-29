import { useState, useRef, useCallback, useEffect } from "preact/hooks";
import { UploadQueue } from "./UploadQueue";
import type { QueueItem, UploaderConfig } from "./uploader";
import { uploadFile } from "./uploader";
import { checkReceipt } from "./vision";

const ACCEPTED = "image/jpeg,image/png,image/webp,application/pdf";
const DEFAULT_FIELD = "file";
const DEFAULT_DELAY = 1200;

function uid() {
  return Math.random().toString(36).slice(2);
}

function loadSettings(): { uploadUrl: string; apiKey: string; fieldName: string } {
  const raw = localStorage.getItem("snelstart_settings");
  if (raw) return JSON.parse(raw);
  return { uploadUrl: "", apiKey: "", fieldName: DEFAULT_FIELD };
}

export function App() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    // Try to auto-detect upload URL from the active SnelStart tab.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "SNELSTART_PING" }, (resp) => {
        if (chrome.runtime.lastError || !resp?.uploadUrl) return;
        setSettings((s) => {
          if (s.uploadUrl) return s;
          const next = { ...s, uploadUrl: resp.uploadUrl };
          localStorage.setItem("snelstart_settings", JSON.stringify(next));
          return next;
        });
      });
    });
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const items: QueueItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/") || f.type === "application/pdf")
      .map((f) => ({
        id: uid(),
        file: f,
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : "/icons/pdf.png",
        status: "pending" as const,
      }));
    setQueue((q) => [...q, ...items]);
  }, []);

  const onFilePick = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) addFiles(input.files);
    input.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files.length) addFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setQueue((q) => q.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((q) => q.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const start = async () => {
    if (!settings.uploadUrl) {
      alert("Stel eerst de upload-URL in via Instellingen.");
      return;
    }
    abortRef.current = false;
    setRunning(true);

    const config: UploaderConfig = {
      uploadUrl: settings.uploadUrl,
      fieldName: settings.fieldName || DEFAULT_FIELD,
      delayMs: DEFAULT_DELAY,
    };

    const pending = queue.filter((i) => i.status === "pending" || i.status === "error");

    for (const item of pending) {
      if (abortRef.current) break;

      if (settings.apiKey) {
        updateItem(item.id, { status: "checking" });
        const result = await checkReceipt(item.file, settings.apiKey).catch(() => null);
        if (result?.warning) {
          updateItem(item.id, { visionWarning: result.warning });
        }
      }

      if (abortRef.current) break;

      await uploadFile(item, config, (id, status, error) => {
        updateItem(id, { status, ...(error ? { error } : {}) });
      });

      await new Promise((r) => setTimeout(r, config.delayMs));
    }

    setRunning(false);
  };

  const stop = () => {
    abortRef.current = true;
  };

  const pendingCount = queue.filter((i) => i.status === "pending" || i.status === "error").length;
  const doneCount = queue.filter((i) => i.status === "done").length;

  if (showSettings) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600 }}>Instellingen</h2>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>SnelStart upload-URL</span>
          <input
            type="url"
            value={settings.uploadUrl}
            onInput={(e) => setSettings((s) => ({ ...s, uploadUrl: (e.target as HTMLInputElement).value }))}
            placeholder="https://app.snelstart.nl/…/upload"
            style={inputStyle}
          />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            Vind de URL via DevTools → Network terwijl je handmatig een bon uploadt.
          </span>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Formulier veldnaam</span>
          <input
            type="text"
            value={settings.fieldName}
            onInput={(e) => setSettings((s) => ({ ...s, fieldName: (e.target as HTMLInputElement).value }))}
            placeholder="file"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Anthropic API-sleutel (optioneel)</span>
          <input
            type="password"
            value={settings.apiKey}
            onInput={(e) => setSettings((s) => ({ ...s, apiKey: (e.target as HTMLInputElement).value }))}
            placeholder="sk-ant-…"
            style={inputStyle}
          />
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            Optioneel: Claude controleert vóór het uploaden of bonnen leesbaar zijn.
          </span>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              localStorage.setItem("snelstart_settings", JSON.stringify(settings));
              setShowSettings(false);
            }}
            style={primaryBtnStyle}
          >
            Opslaan
          </button>
          <button onClick={() => setShowSettings(false)} style={secondaryBtnStyle}>
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Header */}
      <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>SnelStart Batch Upload</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
            {queue.length === 0 ? "Geen bestanden" : `${doneCount}/${queue.length} klaar`}
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={iconBtnStyle} title="Instellingen">
          ⚙
        </button>
      </div>

      {/* Drop zone (shown when queue is empty) */}
      {queue.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            color: "#6b7280",
            border: "2px dashed #d1d5db",
            margin: 16,
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 32 }}>📁</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Sleep bonnen hierheen</div>
          <div style={{ fontSize: 12 }}>of klik om bestanden te kiezen</div>
        </div>
      )}

      {/* Queue */}
      <UploadQueue items={queue} onRemove={removeItem} />

      {/* Footer */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={secondaryBtnStyle}
          disabled={running}
        >
          + Toevoegen
        </button>
        {running ? (
          <button onClick={stop} style={{ ...primaryBtnStyle, background: "#dc2626" }}>
            Stop
          </button>
        ) : (
          <button
            onClick={start}
            style={primaryBtnStyle}
            disabled={pendingCount === 0}
          >
            Upload {pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        style={{ display: "none" }}
        onChange={onFilePick}
      />
    </div>
  );
}

const inputStyle = {
  padding: "6px 8px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 12,
  width: "100%",
};

const primaryBtnStyle = {
  flex: 1,
  padding: "8px 0",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  flex: 1,
  padding: "8px 0",
  background: "#f3f4f6",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
};

const iconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 18,
  padding: "2px 4px",
  color: "#6b7280",
};
