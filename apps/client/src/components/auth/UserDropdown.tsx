import { useState } from "react";
import { Link } from "react-router-dom";

import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, updateUser } from "@/lib/auth.client";

import { ConfirmDialog } from "../ui/confirm-dialog";
import { ThemeTogglerButton } from "../ui/theme-toggle";
import { AvatarSelectorDialog } from "./avatar-selector-dialog";
import UserAvatar from "./UserAvatar";

interface UserDropdownProps {
  email?: string;
  name?: string;
  image?: string | null;
}

export function UserDropdown({ email, name, image }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      setIsUpdating(true);
      await updateUser({
        image: avatarUrl,
      });
      toast.success("Avatar updated successfully");
    } catch (error: any) {
      console.error("Avatar update error:", error);
      toast.error(error.message || "Failed to update avatar");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full hover:bg-accent transition-colors cursor-pointer ml-2">
              <UserAvatar src={image!} alt={name!} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="font-montreal-regular space-y-1 w-56"
          >
            <div className="font-fustat">
              <div className="flex gap-3 items-center p-2">
                <UserAvatar src={image!} alt={name!} />
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium truncate">
                    {name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email}
                  </p>
                </div>
              </div>
            </div>
            <Link to="/settings" className="w-full block font-fustat">
              <div className="px-3 py-1 text-sm text-foreground/70 hover:text-foreground hover:bg-accent rounded-md">
                Settings
              </div>
            </Link>
            <div className="">
              <ThemeTogglerButton className="px-3 font-fustat py-1 cursor-pointer text-sm text-foreground/70 hover:text-foreground hover:bg-accent rounded-md" />
            </div>
            <div className="w-full font-fustat">
              <p
                className="px-3 py-1 text-sm cursor-pointer text-foreground/70 hover:text-foreground hover:bg-accent rounded-md"
                onClick={() => setOpen(true)}
              >
                Logout
              </p>
              <ConfirmDialog
                title="Log Out"
                description="Are you sure you want to log out? Any unsaved changes will be lost."
                onConfirm={async () => {
                  await signOut();
                  setOpen(false);
                }}
                onOpenChange={setOpen}
                confirmText="Log Out"
                cancelText="Cancel"
                open={open}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AvatarSelectorDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        currentAvatarUrl={image || ""}
        onAvatarSelect={handleAvatarSelect}
        isLoading={isUpdating}
      />
    </>
  );
}
