import type { McpServerEntry } from "../types/mcp";

interface McpServerCardProps {
  server: McpServerEntry;
  onEdit: (name: string) => void;
  onDelete: (name: string) => void;
}

export function McpServerCard({ server, onEdit, onDelete }: McpServerCardProps) {
  const config = server.config;
  const command = (config.command as string) ?? "";
  const args = (config.args as string[]) ?? [];
  const env = (config.env as Record<string, string>) ?? {};
  const envCount = Object.keys(env).length;

  const argsSummary =
    args.length > 0
      ? args.join(" ").length > 40
        ? args.join(" ").slice(0, 40) + "..."
        : args.join(" ")
      : "";

  return (
    <div className="profile-card mcp-card">
      <div className="profile-card-header">
        <div className="profile-card-name">{server.name}</div>
      </div>
      {command && (
        <div className="mcp-config-preview">
          <span className="mcp-label">command:</span> {command}
        </div>
      )}
      {argsSummary && (
        <div className="mcp-config-preview">
          <span className="mcp-label">args:</span> {argsSummary}
        </div>
      )}
      {envCount > 0 && (
        <div className="mcp-config-preview">
          <span className="mcp-label">env:</span> {envCount} 个变量
        </div>
      )}
      <div className="profile-card-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(server.name)}
        >
          编辑
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(server.name)}
        >
          删除
        </button>
      </div>
    </div>
  );
}
