import type { McpServerEntry } from "../types/mcp";
import { McpServerCard } from "./McpServerCard";

interface McpServerListProps {
  servers: McpServerEntry[];
  onEdit: (name: string) => void;
  onDelete: (name: string) => void;
}

export function McpServerList({ servers, onEdit, onDelete }: McpServerListProps) {
  return (
    <div className="profile-grid">
      {servers.map((server) => (
        <McpServerCard
          key={server.name}
          server={server}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
