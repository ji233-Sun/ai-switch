import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Profile, ProfileSummary, ProfileFormData } from "../types/profile";

/** 排序：starred 置顶，内部按 updated_at 降序 */
function sortProfiles(list: ProfileSummary[]): ProfileSummary[] {
  return [...list].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [list, activeId] = await Promise.all([
        invoke<ProfileSummary[]>("list_profiles"),
        invoke<string | null>("get_active_profile_id"),
      ]);
      setProfiles(sortProfiles(list));
      setActiveProfileId(activeId);
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
    async (data: ProfileFormData): Promise<Profile> => {
      const profile = await invoke<Profile>("create_profile", {
        name: data.name,
        baseUrl: data.base_url,
        authToken: data.auth_token,
        model: data.model,
        tags: data.tags,
      });
      await refresh();
      return profile;
    },
    [refresh]
  );

  const updateProfile = useCallback(
    async (id: string, data: ProfileFormData): Promise<Profile> => {
      const profile = await invoke<Profile>("update_profile", {
        id,
        name: data.name,
        baseUrl: data.base_url,
        authToken: data.auth_token,
        model: data.model,
        tags: data.tags,
      });
      await refresh();
      return profile;
    },
    [refresh]
  );

  const deleteProfile = useCallback(
    async (id: string): Promise<void> => {
      await invoke("delete_profile", { id });
      await refresh();
    },
    [refresh]
  );

  const activateProfile = useCallback(
    async (id: string): Promise<void> => {
      await invoke("activate_profile", { id });
      await refresh();
    },
    [refresh]
  );

  const toggleStar = useCallback(
    async (id: string): Promise<void> => {
      await invoke<boolean>("toggle_star", { id });
      await refresh();
    },
    [refresh]
  );

  const importFromClaudeCode = useCallback(async (): Promise<Profile> => {
    const profile = await invoke<Profile>("import_from_claude_code");
    await refresh();
    return profile;
  }, [refresh]);

  const getProfile = useCallback(async (id: string): Promise<Profile> => {
    return invoke<Profile>("get_profile", { id });
  }, []);

  const detectActiveProfile = useCallback(async (): Promise<string | null> => {
    return invoke<string | null>("detect_active_profile");
  }, []);

  return {
    profiles,
    activeProfileId,
    loading,
    error,
    clearError,
    refresh,
    createProfile,
    updateProfile,
    deleteProfile,
    activateProfile,
    toggleStar,
    importFromClaudeCode,
    getProfile,
    detectActiveProfile,
  };
}
