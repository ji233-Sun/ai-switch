import type { TabKey } from "./TabBar";

export type ClaudeSubTab = "profiles" | "mcp";

interface HeaderProps {
  onCreateNew: () => void;
  onImport: () => void;
  importing: boolean;
  importLabel: string;
  activeTab: TabKey;
  claudeSubTab: ClaudeSubTab;
  onToggleOpenaiMode: () => void;
  openaiMode: boolean;
}

export function Header({
  onCreateNew,
  onImport,
  importing,
  importLabel,
  activeTab,
  claudeSubTab,
  onToggleOpenaiMode,
  openaiMode,
}: HeaderProps) {
  const isClaudeMcp = activeTab === "claude" && claudeSubTab === "mcp";

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AI Switch</h1>
        <span className="header-subtitle">API 配置管理</span>
      </div>
      <div className="header-actions">
        {activeTab === "codex" && (
          <button
            className={`btn ${openaiMode ? "btn-warning" : "btn-secondary"}`}
            onClick={onToggleOpenaiMode}
          >
            {openaiMode ? "关闭 OpenAI 直连" : "OpenAI 直连"}
          </button>
        )}
        {!isClaudeMcp && (
          <button
            className="btn btn-secondary"
            onClick={onImport}
            disabled={importing}
            aria-busy={importing}
          >
            {importing ? "导入中..." : importLabel}
          </button>
        )}
        <button className="btn btn-primary" onClick={onCreateNew}>
          {isClaudeMcp ? "添加 MCP Server" : "新建配置"}
        </button>
      </div>
    </header>
  );
}
