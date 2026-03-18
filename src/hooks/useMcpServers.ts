import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { McpServerEntry } from "../types/mcp";

export function useMcpServers() {
  const [servers, setServers] = useState<McpServerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const list = await invoke<McpServerEntry[]>("list_mcp_servers");
      // 按名称字母序排序
      setServers([...list].sort((a, b) => a.name.localeCompare(b.name)));
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addServer = useCallback(
    async (name: string, configJson: string): Promise<void> => {
      await invoke("add_mcp_server", { name, config: configJson });
      await refresh();
    },
    [refresh]
  );

  const updateServer = useCallback(
    async (name: string, configJson: string): Promise<void> => {
      await invoke("update_mcp_server", { name, config: configJson });
      await refresh();
    },
    [refresh]
  );

  const deleteServer = useCallback(
    async (name: string): Promise<void> => {
      await invoke("delete_mcp_server", { name });
      await refresh();
    },
    [refresh]
  );

  return {
    servers,
    loading,
    error,
    clearError,
    refresh,
    addServer,
    updateServer,
    deleteServer,
  };
}
