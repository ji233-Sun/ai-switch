import { useState, useCallback, useEffect, useRef } from "react";
import { useProfiles } from "./hooks/useProfiles";
import { useCodexProfiles } from "./hooks/useCodexProfiles";
import { useMcpServers } from "./hooks/useMcpServers";
import { Header } from "./components/Header";
import type { ClaudeSubTab } from "./components/Header";
import { TabBar } from "./components/TabBar";
import type { TabKey } from "./components/TabBar";
import { ProfileList } from "./components/ProfileList";
import { ProfileForm } from "./components/ProfileForm";
import { CodexProfileList } from "./components/CodexProfileList";
import { CodexProfileForm } from "./components/CodexProfileForm";
import { McpServerList } from "./components/McpServerList";
import { McpServerForm } from "./components/McpServerForm";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EmptyState } from "./components/EmptyState";
import type { Profile, ProfileFormData } from "./types/profile";
import type { CodexProfile, CodexProfileFormData } from "./types/codex";
import "./App.css";

type ModalState =
  | { type: "none" }
  | { type: "create-claude" }
  | { type: "edit-claude"; profile: Profile }
  | { type: "delete-claude"; id: string; name: string }
  | { type: "create-codex" }
  | { type: "edit-codex"; profile: CodexProfile }
  | { type: "delete-codex"; id: string; name: string }
  | { type: "create-mcp" }
  | { type: "edit-mcp"; name: string; configJson: string }
  | { type: "delete-mcp"; name: string };

interface ToastState {
  message: string;
  type: "success" | "error";
  exiting: boolean;
}

function App() {
  const claude = useProfiles();
  const codex = useCodexProfiles();
  const mcp = useMcpServers();

  const [activeTab, setActiveTab] = useState<TabKey>("claude");
  const [claudeSubTab, setClaudeSubTab] = useState<ClaudeSubTab>("profiles");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: "success" | "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, exiting: false });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, exiting: true } : null));
      toastTimer.current = setTimeout(() => setToast(null), 150);
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleCloseModal = () => setModal({ type: "none" });

  // --- Claude Code handlers ---
  const handleClaudeCreateNew = () => setModal({ type: "create-claude" });

  const handleClaudeEdit = async (id: string) => {
    try {
      const profile = await claude.getProfile(id);
      setModal({ type: "edit-claude", profile });
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleClaudeDelete = (id: string) => {
    const profile = claude.profiles.find((p) => p.id === id);
    if (profile) {
      setModal({ type: "delete-claude", id, name: profile.name });
    }
  };

  const handleClaudeActivate = async (id: string) => {
    try {
      await claude.activateProfile(id);
      showToast("Claude Code 配置已激活", "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleClaudeToggleStar = async (id: string) => {
    try {
      await claude.toggleStar(id);
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleClaudeImport = async () => {
    try {
      setImporting(true);
      const profile = await claude.importFromClaudeCode();
      showToast(`已导入配置: ${profile.name}`, "success");
    } catch (e) {
      showToast(String(e), "error");
    } finally {
      setImporting(false);
    }
  };

  const handleClaudeCreateSubmit = async (data: ProfileFormData) => {
    await claude.createProfile(data);
    setModal({ type: "none" });
    showToast("配置已创建", "success");
  };

  const handleClaudeEditSubmit = async (data: ProfileFormData) => {
    if (modal.type !== "edit-claude") return;
    await claude.updateProfile(modal.profile.id, data);
    setModal({ type: "none" });
    showToast("配置已更新", "success");
  };

  const handleClaudeDeleteConfirm = async () => {
    if (modal.type !== "delete-claude") return;
    try {
      await claude.deleteProfile(modal.id);
      setModal({ type: "none" });
      showToast("配置已删除", "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  // --- Codex handlers ---
  const handleCodexCreateNew = () => setModal({ type: "create-codex" });

  const handleCodexEdit = async (id: string) => {
    try {
      const profile = await codex.getProfile(id);
      setModal({ type: "edit-codex", profile });
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleCodexDelete = (id: string) => {
    const profile = codex.profiles.find((p) => p.id === id);
    if (profile) {
      setModal({ type: "delete-codex", id, name: profile.name });
    }
  };

  const handleCodexActivate = async (id: string) => {
    try {
      await codex.activateProfile(id);
      showToast("Codex 配置已激活", "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleCodexToggleStar = async (id: string) => {
    try {
      await codex.toggleStar(id);
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleCodexImport = async () => {
    try {
      setImporting(true);
      const profile = await codex.importFromCodex();
      showToast(`已导入 Codex 配置: ${profile.name}`, "success");
    } catch (e) {
      showToast(String(e), "error");
    } finally {
      setImporting(false);
    }
  };

  const handleCodexCreateSubmit = async (data: CodexProfileFormData) => {
    await codex.createProfile(data);
    setModal({ type: "none" });
    showToast("Codex 配置已创建", "success");
  };

  const handleCodexEditSubmit = async (data: CodexProfileFormData) => {
    if (modal.type !== "edit-codex") return;
    await codex.updateProfile(modal.profile.id, data);
    setModal({ type: "none" });
    showToast("Codex 配置已更新", "success");
  };

  const handleCodexDeleteConfirm = async () => {
    if (modal.type !== "delete-codex") return;
    try {
      await codex.deleteProfile(modal.id);
      setModal({ type: "none" });
      showToast("Codex 配置已删除", "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  const handleToggleOpenaiMode = async () => {
    try {
      await codex.setOpenaiMode(!codex.openaiMode);
      showToast(
        codex.openaiMode ? "已关闭 OpenAI 直连模式" : "已开启 OpenAI 直连模式",
        "success"
      );
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  // --- MCP handlers ---
  const handleMcpCreateNew = () => setModal({ type: "create-mcp" });

  const handleMcpEdit = (name: string) => {
    const server = mcp.servers.find((s) => s.name === name);
    if (server) {
      setModal({
        type: "edit-mcp",
        name: server.name,
        configJson: JSON.stringify(server.config, null, 2),
      });
    }
  };

  const handleMcpDelete = (name: string) => {
    setModal({ type: "delete-mcp", name });
  };

  const handleMcpCreateSubmit = async (name: string, configJson: string) => {
    await mcp.addServer(name, configJson);
    setModal({ type: "none" });
    showToast(`MCP server "${name}" 已添加`, "success");
  };

  const handleMcpEditSubmit = async (name: string, configJson: string) => {
    await mcp.updateServer(name, configJson);
    setModal({ type: "none" });
    showToast(`MCP server "${name}" 已更新`, "success");
  };

  const handleMcpDeleteConfirm = async () => {
    if (modal.type !== "delete-mcp") return;
    try {
      await mcp.deleteServer(modal.name);
      setModal({ type: "none" });
      showToast(`MCP server "${modal.name}" 已删除`, "success");
    } catch (e) {
      showToast(String(e), "error");
    }
  };

  // Create handler based on current context
  const handleCreateNew = () => {
    if (activeTab === "claude") {
      claudeSubTab === "mcp" ? handleMcpCreateNew() : handleClaudeCreateNew();
    } else {
      handleCodexCreateNew();
    }
  };

  // Current tab loading/error state
  const currentLoading =
    activeTab === "claude"
      ? claude.loading || (claudeSubTab === "mcp" && mcp.loading)
      : codex.loading;
  const currentError =
    activeTab === "claude"
      ? claudeSubTab === "mcp"
        ? mcp.error
        : claude.error
      : codex.error;
  const clearCurrentError =
    activeTab === "claude"
      ? claudeSubTab === "mcp"
        ? mcp.clearError
        : claude.clearError
      : codex.clearError;

  if (currentLoading) {
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
      <Header
        onCreateNew={handleCreateNew}
        onImport={activeTab === "claude" ? handleClaudeImport : handleCodexImport}
        importing={importing}
        importLabel={activeTab === "claude" ? "从 Claude Code 导入" : "从 Codex 导入"}
        activeTab={activeTab}
        claudeSubTab={claudeSubTab}
        onToggleOpenaiMode={handleToggleOpenaiMode}
        openaiMode={codex.openaiMode}
      />

      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {currentError && (
        <div className="error-bar" role="alert">
          <span>{currentError}</span>
          <button
            className="error-bar-close"
            onClick={clearCurrentError}
            aria-label="关闭错误提示"
          >
            &times;
          </button>
        </div>
      )}

      {activeTab === "claude" && (
        <>
          {/* Claude Code sub-tabs */}
          <div className="sub-tab-bar" role="tablist">
            <button
              className={`sub-tab-item ${claudeSubTab === "profiles" ? "sub-tab-item-active" : ""}`}
              role="tab"
              aria-selected={claudeSubTab === "profiles"}
              onClick={() => setClaudeSubTab("profiles")}
            >
              配置
            </button>
            <button
              className={`sub-tab-item ${claudeSubTab === "mcp" ? "sub-tab-item-active" : ""}`}
              role="tab"
              aria-selected={claudeSubTab === "mcp"}
              onClick={() => setClaudeSubTab("mcp")}
            >
              MCP Servers
            </button>
          </div>

          {claudeSubTab === "profiles" && (
            <>
              {claude.profiles.length === 0 ? (
                <EmptyState onCreateNew={handleClaudeCreateNew} onImport={handleClaudeImport} />
              ) : (
                <ProfileList
                  profiles={claude.profiles}
                  activeProfileId={claude.activeProfileId}
                  onActivate={handleClaudeActivate}
                  onEdit={handleClaudeEdit}
                  onDelete={handleClaudeDelete}
                  onToggleStar={handleClaudeToggleStar}
                />
              )}
            </>
          )}

          {claudeSubTab === "mcp" && (
            <>
              {mcp.servers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 9a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0v-1a3 3 0 0 0-3-3Z" />
                      <path d="M5 9a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0v-1a3 3 0 0 0-3-3Z" />
                      <path d="M12 18a3 3 0 0 0-3 3 3 3 0 0 0 6 0 3 3 0 0 0-3-3Z" />
                      <path d="M12 6v6m0 6v-6m0 0-6-1.5M12 12l6-1.5M12 12l-6 1.5m6-1.5 6 1.5" />
                    </svg>
                  </div>
                  <h2>还没有 MCP Server</h2>
                  <p>添加一个 MCP server 配置到 ~/.claude.json 中管理。</p>
                  <div className="empty-state-actions">
                    <button className="btn btn-primary" onClick={handleMcpCreateNew}>
                      添加 MCP Server
                    </button>
                  </div>
                </div>
              ) : (
                <McpServerList
                  servers={mcp.servers}
                  onEdit={handleMcpEdit}
                  onDelete={handleMcpDelete}
                />
              )}
            </>
          )}
        </>
      )}

      {activeTab === "codex" && (
        <>
          {codex.profiles.length === 0 && !codex.openaiMode ? (
            <EmptyState onCreateNew={handleCodexCreateNew} onImport={handleCodexImport} />
          ) : (
            <CodexProfileList
              profiles={codex.profiles}
              activeProfileId={codex.activeProfileId}
              openaiMode={codex.openaiMode}
              onActivate={handleCodexActivate}
              onEdit={handleCodexEdit}
              onDelete={handleCodexDelete}
              onToggleStar={handleCodexToggleStar}
              onToggleOpenaiMode={handleToggleOpenaiMode}
            />
          )}
        </>
      )}

      {/* Claude Code modals */}
      {modal.type === "create-claude" && (
        <ProfileForm onSubmit={handleClaudeCreateSubmit} onCancel={handleCloseModal} />
      )}
      {modal.type === "edit-claude" && (
        <ProfileForm
          initial={modal.profile}
          onSubmit={handleClaudeEditSubmit}
          onCancel={handleCloseModal}
        />
      )}
      {modal.type === "delete-claude" && (
        <ConfirmDialog
          title="删除配置"
          message={`确定要删除 Claude Code 配置 "${modal.name}" 吗？此操作不可撤销。`}
          confirmText="删除"
          danger
          onConfirm={handleClaudeDeleteConfirm}
          onCancel={handleCloseModal}
        />
      )}

      {/* Codex modals */}
      {modal.type === "create-codex" && (
        <CodexProfileForm onSubmit={handleCodexCreateSubmit} onCancel={handleCloseModal} />
      )}
      {modal.type === "edit-codex" && (
        <CodexProfileForm
          initial={modal.profile}
          onSubmit={handleCodexEditSubmit}
          onCancel={handleCloseModal}
        />
      )}
      {modal.type === "delete-codex" && (
        <ConfirmDialog
          title="删除配置"
          message={`确定要删除 Codex 配置 "${modal.name}" 吗？此操作不可撤销。`}
          confirmText="删除"
          danger
          onConfirm={handleCodexDeleteConfirm}
          onCancel={handleCloseModal}
        />
      )}

      {/* MCP modals */}
      {modal.type === "create-mcp" && (
        <McpServerForm onSubmit={handleMcpCreateSubmit} onCancel={handleCloseModal} />
      )}
      {modal.type === "edit-mcp" && (
        <McpServerForm
          initial={{ name: modal.name, configJson: modal.configJson }}
          onSubmit={handleMcpEditSubmit}
          onCancel={handleCloseModal}
        />
      )}
      {modal.type === "delete-mcp" && (
        <ConfirmDialog
          title="删除 MCP Server"
          message={`确定要删除 MCP server "${modal.name}" 吗？此操作将从 ~/.claude.json 中移除该配置。`}
          confirmText="删除"
          danger
          onConfirm={handleMcpDeleteConfirm}
          onCancel={handleCloseModal}
        />
      )}

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
