import type { ProfileSummary } from "../types/profile";

interface ProfileCardProps {
  profile: ProfileSummary;
  isActive: boolean;
  onActivate: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function ProfileCard({
  profile,
  isActive,
  onActivate,
  onEdit,
  onDelete,
  onToggleStar,
}: ProfileCardProps) {
  return (
    <div className={`profile-card ${isActive ? "profile-card-active" : ""}`}>
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
          {isActive && <span className="badge-active">当前</span>}
        </div>
      </div>
      {profile.tags.length > 0 && (
        <div className="tag-list">
          {profile.tags.map((tag, i) => (
            <span key={i} className="tag-badge tag-badge-sm">{tag}</span>
          ))}
        </div>
      )}
      <div className="profile-card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onActivate(profile.id)}
          disabled={isActive}
        >
          {isActive ? "已激活" : "激活"}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(profile.id)}>
          编辑
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(profile.id)}>
          删除
        </button>
      </div>
    </div>
  );
}
