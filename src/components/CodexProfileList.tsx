import type { CodexProfileSummary } from "../types/codex";
import { CodexProfileCard } from "./CodexProfileCard";

interface CodexProfileListProps {
  profiles: CodexProfileSummary[];
  activeProfileId: string | null;
  openaiMode: boolean;
  onActivate: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleOpenaiMode: () => void;
}

export function CodexProfileList({
  profiles,
  activeProfileId,
  openaiMode,
  onActivate,
  onEdit,
  onDelete,
  onToggleStar,
  onToggleOpenaiMode,
}: CodexProfileListProps) {
  return (
    <>
      {openaiMode && (
        <div className="openai-mode-banner" role="status">
          <div className="openai-mode-banner-content">
            <span className="openai-mode-banner-icon">&#9889;</span>
            <div>
              <strong>OpenAI 直连模式</strong>
              <p>所有自定义 API 配置已停用，Codex 使用 OpenAI 官方服务</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onToggleOpenaiMode}>
            关闭直连
          </button>
        </div>
      )}
      <div className="profile-grid">
        {profiles.map((profile) => (
          <CodexProfileCard
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfileId}
            openaiMode={openaiMode}
            onActivate={onActivate}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>
    </>
  );
}
