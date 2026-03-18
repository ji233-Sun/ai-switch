import type { ProfileSummary } from "../types/profile";
import { ProfileCard } from "./ProfileCard";

interface ProfileListProps {
  profiles: ProfileSummary[];
  activeProfileId: string | null;
  onActivate: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function ProfileList({
  profiles,
  activeProfileId,
  onActivate,
  onEdit,
  onDelete,
  onToggleStar,
}: ProfileListProps) {
  return (
    <div className="profile-grid">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          isActive={profile.id === activeProfileId}
          onActivate={onActivate}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
      ))}
    </div>
  );
}
