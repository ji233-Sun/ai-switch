import { useState, useEffect, useRef } from "react";
import type { CodexProfile, CodexProfileFormData } from "../types/codex";

interface CodexProfileFormProps {
  initial?: CodexProfile | null;
  onSubmit: (data: CodexProfileFormData) => Promise<void>;
  onCancel: () => void;
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

const EFFORT_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "XHigh" },
];

const MAX_TAG_LENGTH = 20;

export function CodexProfileForm({ initial, onSubmit, onCancel }: CodexProfileFormProps) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [effort, setEffort] = useState("high");
  const [serviceTierFast, setServiceTierFast] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setBaseUrl(initial.base_url);
      setApiKey(initial.api_key);
      setModel(initial.model);
      setEffort(initial.model_reasoning_effort || "high");
      setServiceTierFast(initial.service_tier_fast);
      setTags(initial.tags ?? []);
    }
  }, [initial]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseUrl.trim() || !apiKey.trim() || !model.trim()) {
      setError("名称、Base URL、API Key 和 Model 为必填项");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        base_url: baseUrl.trim(),
        api_key: apiKey.trim(),
        model: model.trim(),
        model_reasoning_effort: effort,
        service_tier_fast: serviceTierFast,
        tags,
      });
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal modal-form"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="codex-form-title"
      >
        <h2 id="codex-form-title" className="modal-title">
          {isEdit ? "编辑 Codex 配置" : "新建 Codex 配置"}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="codex-name">名称 *</label>
            <input
              ref={nameInputRef}
              id="codex-name"
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: My Codex Config"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codex-base-url">Base URL *</label>
            <input
              id="codex-base-url"
              className="form-input"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              autoComplete="url"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codex-api-key">API Key *</label>
            <div className="form-input-wrapper">
              <input
                id="codex-api-key"
                className="form-input form-input-has-toggle"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "隐藏 API Key" : "显示 API Key"}
                tabIndex={0}
              >
                {showKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codex-model">Model *</label>
            <input
              id="codex-model"
              className="form-input"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="例如: o3, gpt-5.4"
              autoComplete="off"
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group-flex">
              <label className="form-label" htmlFor="codex-effort">Reasoning Effort</label>
              <select
                id="codex-effort"
                className="form-input form-select"
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
              >
                {EFFORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group form-group-flex">
              <label className="form-label">Service Tier Fast</label>
              <label className="form-toggle">
                <input
                  type="checkbox"
                  checked={serviceTierFast}
                  onChange={(e) => setServiceTierFast(e.target.checked)}
                />
                <span className="form-toggle-slider" />
                <span className="form-toggle-label">
                  {serviceTierFast ? "开启" : "关闭"}
                </span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codex-tags">标签</label>
            <div className="tag-input-area">
              {tags.map((tag, i) => (
                <span key={i} className="tag-badge">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag(i)}
                    aria-label={`删除标签 ${tag}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                id="codex-tags"
                className="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                placeholder={tags.length === 0 ? "输入标签后按 Enter 添加" : ""}
                autoComplete="off"
              />
            </div>
            <span className="form-hint">按 Enter 或逗号添加标签，Backspace 删除</span>
          </div>
          {error && (
            <div className="form-error" role="alert">{error}</div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "保存中..." : isEdit ? "更新" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
