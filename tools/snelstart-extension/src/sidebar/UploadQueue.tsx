import type { QueueItem, UploadStatus } from "./uploader";

const STATUS_LABEL: Record<UploadStatus, string> = {
  pending: "Wachten",
  checking: "Controleren…",
  uploading: "Uploaden…",
  done: "Klaar ✓",
  error: "Fout",
};

const STATUS_COLOR: Record<UploadStatus, string> = {
  pending: "#6b7280",
  checking: "#7c3aed",
  uploading: "#2563eb",
  done: "#16a34a",
  error: "#dc2626",
};

interface Props {
  items: QueueItem[];
  onRemove: (id: string) => void;
}

export function UploadQueue({ items, onRemove }: Props) {
  if (items.length === 0) return null;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 0",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <img
            src={item.preview}
            alt=""
            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.file.name}
            </div>
            {item.visionWarning && (
              <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>
                ⚠ {item.visionWarning}
              </div>
            )}
            {item.error && (
              <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>
                {item.error}
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: STATUS_COLOR[item.status], flexShrink: 0 }}>
            {STATUS_LABEL[item.status]}
          </div>
          {item.status === "pending" || item.status === "error" ? (
            <button
              onClick={() => onRemove(item.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px" }}
              aria-label="Verwijder"
            >
              ✕
            </button>
          ) : (
            <div style={{ width: 20 }} />
          )}
        </div>
      ))}
    </div>
  );
}
