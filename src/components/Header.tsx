interface HeaderProps {
  onCreateNew: () => void;
  onImport: () => void;
  importing: boolean;
}

export function Header({ onCreateNew, onImport, importing }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AI Switch</h1>
        <span className="header-subtitle">Claude Code 配置管理</span>
      </div>
      <div className="header-actions">
        <button
          className="btn btn-secondary"
          onClick={onImport}
          disabled={importing}
          aria-busy={importing}
        >
          {importing ? "导入中..." : "从 Claude Code 导入"}
        </button>
        <button className="btn btn-primary" onClick={onCreateNew}>
          新建配置
        </button>
      </div>
    </header>
  );
}
