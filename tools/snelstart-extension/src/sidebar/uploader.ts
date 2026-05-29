export type UploadStatus = "pending" | "checking" | "uploading" | "done" | "error";

export interface QueueItem {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  error?: string;
  visionWarning?: string;
}

export interface UploaderConfig {
  uploadUrl: string;
  fieldName: string;
  delayMs: number;
}

export async function uploadFile(
  item: QueueItem,
  config: UploaderConfig,
  onProgress: (id: string, status: UploadStatus, detail?: string) => void
): Promise<void> {
  onProgress(item.id, "uploading");

  const body = new FormData();
  body.append(config.fieldName, item.file, item.file.name);

  let response: Response;
  try {
    response = await fetch(config.uploadUrl, {
      method: "POST",
      body,
      credentials: "include",
    });
  } catch (err) {
    onProgress(item.id, "error", `Netwerkfout: ${String(err)}`);
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    onProgress(item.id, "error", `HTTP ${response.status}: ${text.slice(0, 120)}`);
    return;
  }

  onProgress(item.id, "done");
}
