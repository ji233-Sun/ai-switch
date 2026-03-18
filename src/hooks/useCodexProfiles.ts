import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  CodexProfile,
  CodexProfileSummary,
  CodexProfileFormData,
  CodexStoreState,
} from "../types/codex";

/** 排序：starred 置顶，内部按 updated_at 降序 */
function sortProfiles(list: CodexProfileSummary[]): CodexProfileSummary[] {
  return [...list].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export function useCodexProfiles() {
  const [profiles, setProfiles] = useState<CodexProfileSummary[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [openaiMode, setOpenaiModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [list, storeState] = await Promise.all([
        invoke<CodexProfileSummary[]>("list_codex_profiles"),
        invoke<CodexStoreState>("get_codex_store_state"),
      ]);
      setProfiles(sortProfiles(list));
      setActiveProfileId(storeState.active_profile_id);
      setOpenaiModeState(storeState.openai_mode);
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

  const createProfile = useCallback(
    async (data: CodexProfileFormData): Promise<CodexProfile> => {
      const profile = await invoke<CodexProfile>("create_codex_profile", {
        name: data.name,
        baseUrl: data.base_url,
        apiKey: data.api_key,
        model: data.model,
        modelReasoningEffort: data.model_reasoning_effort,
        serviceTierFast: data.service_tier_fast,
        tags: data.tags,
      });
      await refresh();
      return profile;
    },
    [refresh]
  );

  const updateProfile = useCallback(
    async (id: string, data: CodexProfileFormData): Promise<CodexProfile> => {
      const profile = await invoke<CodexProfile>("update_codex_profile", {
        id,
        name: data.name,
        baseUrl: data.base_url,
        apiKey: data.api_key,
        model: data.model,
        modelReasoningEffort: data.model_reasoning_effort,
        serviceTierFast: data.service_tier_fast,
        tags: data.tags,
      });
      await refresh();
      return profile;
    },
    [refresh]
  );

  const deleteProfile = useCallback(
    async (id: string): Promise<void> => {
      await invoke("delete_codex_profile", { id });
      await refresh();
    },
    [refresh]
  );

  const activateProfile = useCallback(
    async (id: string): Promise<void> => {
      await invoke("activate_codex_profile", { id });
      await refresh();
    },
    [refresh]
  );

  const toggleStar = useCallback(
    async (id: string): Promise<void> => {
      await invoke<boolean>("toggle_codex_star", { id });
      await refresh();
    },
    [refresh]
  );

  const setOpenaiMode = useCallback(
    async (enabled: boolean): Promise<void> => {
      await invoke("set_openai_mode", { enabled });
      await refresh();
    },
    [refresh]
  );

  const importFromCodex = useCallback(async (): Promise<CodexProfile> => {
    const profile = await invoke<CodexProfile>("import_from_codex");
    await refresh();
    return profile;
  }, [refresh]);

  const getProfile = useCallback(async (id: string): Promise<CodexProfile> => {
    return invoke<CodexProfile>("get_codex_profile", { id });
  }, []);

  return {
    profiles,
    activeProfileId,
    openaiMode,
    loading,
    error,
    clearError,
    refresh,
    createProfile,
    updateProfile,
    deleteProfile,
    activateProfile,
    toggleStar,
    setOpenaiMode,
    importFromCodex,
    getProfile,
  };
}
