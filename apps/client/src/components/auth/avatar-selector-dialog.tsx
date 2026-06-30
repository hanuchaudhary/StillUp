import { useState, useCallback, memo } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AVATARS } from "@/constants/avatars";

interface AvatarSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string;
  onAvatarSelect: (avatarUrl: string) => void;
  isLoading?: boolean;
}

const AvatarCard = memo(
  ({
    avatar,
    isSelected,
    onSelect,
  }: {
    avatar: (typeof AVATARS)[0];
    isSelected: boolean;
    onSelect: (url: string) => void;
  }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <div className="relative group">
        <button
          type="button"
          onClick={() => onSelect(avatar.url)}
          className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary cursor-pointer ${
            isSelected
              ? "border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-0"
              : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
          }`}
          aria-label={`Select ${avatar.name} avatar`}
          aria-pressed={isSelected}
        >
          {imageError ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Failed to load</span>
            </div>
          ) : (
            <img
              src={avatar.url}
              alt={avatar.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
          )}
        </button>
        <p className="text-center text-xs font-medium mt-2 text-foreground truncate">
          {avatar.name}
        </p>
      </div>
    );
  }
);

AvatarCard.displayName = "AvatarCard";

export function AvatarSelectorDialog({
  open,
  onOpenChange,
  currentAvatarUrl,
  onAvatarSelect,
  isLoading = false,
}: AvatarSelectorDialogProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarUrl || "");

  const handleSelect = useCallback((url: string) => {
    setSelectedAvatar(url);
  }, []);

  const handleSave = useCallback(() => {
    if (selectedAvatar) {
      onAvatarSelect(selectedAvatar);
      onOpenChange(false);
    }
  }, [selectedAvatar, onAvatarSelect, onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setSelectedAvatar(currentAvatarUrl || "");
      }
      onOpenChange(newOpen);
    },
    [currentAvatarUrl, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-xl max-h-[80vh] font-geist overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Your Avatar</DialogTitle>
          <DialogDescription>
            Choose from our collection of avatars. Your selection will be saved
            to your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 py-6">
          {AVATARS.map((avatar) => (
            <AvatarCard
              key={avatar.url}
              avatar={avatar}
              isSelected={selectedAvatar === avatar.url}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedAvatar || isLoading}
            aria-label="Save selected avatar"
          >
            {isLoading ? "Saving..." : "Save Avatar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
