import { useState, useEffect, useRef } from "react";

interface McpServerFormProps {
  /** 编辑模式时传入 server 名称和当前配置 JSON */
  initial?: { name: string; configJson: string } | null;
  onSubmit: (name: string, configJson: string) => Promise<void>;
  onCancel: () => void;
}

export function McpServerForm({ initial, onSubmit, onCancel }: McpServerFormProps) {
  const [name, setName] = useState("");
  const [configJson, setConfigJson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setConfigJson(initial.configJson);
    }
  }, [initial]);

  // Auto focus: 添加模式聚焦名称，编辑模式聚焦 JSON
  useEffect(() => {
    if (isEdit) {
      textareaRef.current?.focus();
    } else {
      nameInputRef.current?.focus();
    }
  }, [isEdit]);

  // Escape 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const validateJson = (json: string): string | null => {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return "配置必须是 JSON object";
      }
      return null;
    } catch {
      return "JSON 格式错误";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("名称为必填项");
      return;
    }

    if (!configJson.trim()) {
      setError("JSON 配置为必填项");
      return;
    }

    const jsonError = validateJson(configJson);
    if (jsonError) {
      setError(jsonError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(name.trim(), configJson.trim());
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(configJson);
      setConfigJson(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError("JSON 格式错误，无法格式化");
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal modal-form"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-form-title"
      >
        <h2 id="mcp-form-title" className="modal-title">
          {isEdit ? "编辑 MCP Server" : "添加 MCP Server"}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="mcp-name">
              名称 *
            </label>
            <input
              ref={nameInputRef}
              id="mcp-name"
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: my-mcp-server"
              autoComplete="off"
              readOnly={isEdit}
              style={isEdit ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
            />
          </div>
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" htmlFor="mcp-config" style={{ marginBottom: 0 }}>
                JSON 配置 *
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleFormat}
                style={{ fontSize: "12px" }}
              >
                格式化
              </button>
            </div>
            <textarea
              ref={textareaRef}
              id="mcp-config"
              className="form-input mcp-json-input"
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder='{"command": "npx", "args": ["-y", "server-name"], "env": {}}'
              rows={10}
              spellCheck={false}
            />
            <span className="form-hint">
              输入 MCP server 的完整 JSON 配置，包含 command、args、env 等字段
            </span>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "保存中..." : isEdit ? "更新" : "添加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
