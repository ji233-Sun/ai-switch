export type TabKey = "claude" | "codex";

interface TabBarProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="tab-bar" role="tablist">
      <button
        className={`tab-item ${activeTab === "claude" ? "tab-item-active" : ""}`}
        role="tab"
        aria-selected={activeTab === "claude"}
        onClick={() => onChange("claude")}
      >
        Claude Code
      </button>
      <button
        className={`tab-item ${activeTab === "codex" ? "tab-item-active" : ""}`}
        role="tab"
        aria-selected={activeTab === "codex"}
        onClick={() => onChange("codex")}
      >
        Codex
      </button>
    </div>
  );
}
