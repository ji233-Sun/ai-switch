import { useState, useCallback, useEffect, useRef } from "react";
import { useProfiles } from "./hooks/useProfiles";
import { Header } from "./components/Header";
import { ProfileList } from "./components/ProfileList";
import { ProfileForm } from "./components/ProfileForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EmptyState } from "./components/EmptyState";
import type { Profile, ProfileFormData } from "./types/profile";
import "./App.css";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; profile: Profile }
  | { type: "delete"; id: string; name: string };

interface ToastState {
  message: string;
  type: "success" | "error";
  exiting: boolean;
}

function App() {
  const {
    profiles,
    activeProfileId,
    loading,
    error,
    clearError,
    createProfile,
    updateProfile,
    deleteProfile,
    activateProfile,
    toggleStar,
    importFromClaudeCode,
    getProfile,
  } = useProfiles();

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: "success" | "error") => {
    // Clear any pending timer
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, exiting: false });

    // Start exit animation before removal
    toastTimer.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, exiting: true } : null));
      toastTimer.current = setTimeout(() => setToast(null), 150);
    }, 2800);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleCreateNew = () => setModal({ type: "create" });
  const handleCloseModal = () => setModal({ type: "none" });

  const handleEdit = async (id: string) => {
    try {
      const profile = await getProfile(id);
      setModal({ type: "edit", profile });
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleDelete = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      setModal({ type: "delete", id, name: profile.name });
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateProfile(id);
      showToast("配置已激活", "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleToggleStar = async (id: string) => {
    try {
      await toggleStar(id);
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const profile = await importFromClaudeCode();
      showToast(`已导入配置: ${profile.name}`, "success");
    } catch (e) {
      showToast(String(e), "error");
    } finally {
      setImporting(false);
    }
  };

  const handleCreateSubmit = async (data: ProfileFormData) => {
    await createProfile(data);
    setModal({ type: "none" });
    showToast("配置已创建", "success");
  };

  const handleEditSubmit = async (data: ProfileFormData) => {
    if (modal.type !== "edit") return;
    await updateProfile(modal.profile.id, data);
    setModal({ type: "none" });
    showToast("配置已更新", "success");
  };

  const handleDeleteConfirm = async () => {
    if (modal.type !== "delete") return;
    try {
      await deleteProfile(modal.id);
      setModal({ type: "none" });
      showToast("配置已删除", "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="loading">
          <div className="loading-spinner" />
          <span className="loading-text">加载中...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <Header onCreateNew={handleCreateNew} onImport={handleImport} importing={importing} />

      {error && (
        <div className="error-bar" role="alert">
          <span>{error}</span>
          <button
            className="error-bar-close"
            onClick={clearError}
            aria-label="关闭错误提示"
          >
            &times;
          </button>
        </div>
      )}

      {profiles.length === 0 ? (
        <EmptyState onCreateNew={handleCreateNew} onImport={handleImport} />
      ) : (
        <ProfileList
          profiles={profiles}
          activeProfileId={activeProfileId}
          onActivate={handleActivate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStar={handleToggleStar}
        />
      )}

      {modal.type === "create" && (
        <ProfileForm onSubmit={handleCreateSubmit} onCancel={handleCloseModal} />
      )}

      {modal.type === "edit" && (
        <ProfileForm
          initial={modal.profile}
          onSubmit={handleEditSubmit}
          onCancel={handleCloseModal}
        />
      )}

      {modal.type === "delete" && (
        <ConfirmDialog
          title="删除配置"
          message={`确定要删除配置 "${modal.name}" 吗？此操作不可撤销。`}
          confirmText="删除"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={handleCloseModal}
        />
      )}

      {/* Toast notification with aria-live for screen readers */}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast toast-${toast.type} ${toast.exiting ? "toast-exit" : ""}`}>
            {toast.message}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
