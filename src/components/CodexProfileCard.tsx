import type { CodexProfileSummary } from "../types/codex";

interface CodexProfileCardProps {
  profile: CodexProfileSummary;
  isActive: boolean;
  openaiMode: boolean;
  onActivate: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

/** effort 简写映射 */
const effortLabel: Record<string, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
  xhigh: "XHigh",
};

export function CodexProfileCard({
  profile,
  isActive,
  openaiMode,
  onActivate,
  onEdit,
  onDelete,
  onToggleStar,
}: CodexProfileCardProps) {
  const showActive = isActive && !openaiMode;

  return (
    <div className={`profile-card ${showActive ? "profile-card-active" : ""}`}>
      <div className="profile-card-header">
        <button
          className={`card-star ${profile.starred ? "card-star-active" : ""}`}
          onClick={() => onToggleStar(profile.id)}
          aria-label={profile.starred ? "取消星标" : "添加星标"}
        >
          {profile.starred ? "\u2605" : "\u2606"}
        </button>
        <div className="profile-card-name">
          {profile.name}
          {showActive && <span className="badge-active">当前</span>}
        </div>
      </div>
      {profile.tags.length > 0 && (
        <div className="tag-list">
          {profile.tags.map((tag, i) => (
            <span key={i} className="tag-badge tag-badge-sm">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="codex-model-info">
        {profile.model}
        <span className="codex-model-separator">&middot;</span>
        {effortLabel[profile.model_reasoning_effort] ?? profile.model_reasoning_effort}
        {profile.service_tier_fast && (
          <>
            <span className="codex-model-separator">&middot;</span>
            <span className="codex-fast-badge">Fast</span>
          </>
        )}
      </div>
      <div className="profile-card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onActivate(profile.id)}
          disabled={showActive || openaiMode}
        >
          {showActive ? "已激活" : "激活"}
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(profile.id)}
        >
          编辑
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(profile.id)}
        >
          删除
        </button>
      </div>
    </div>
  );
}
