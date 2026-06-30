import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { AvatarSelectorDialog } from "@/components/auth/avatar-selector-dialog";
import UserAvatar from "@/components/auth/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateUser, useSession } from "@/lib/auth.client";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function SettingsPage() {
  const { data } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (data?.user) {
      form.reset({
        name: data.user.name || "",
        email: data.user.email || "",
      });
    }
  }, [data?.user, form]);

  const onSubmit = async (formData: ProfileInput) => {
    try {
      setIsUpdating(true);
      await updateUser({
        name: formData.name,
      });
      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const navigate = useNavigate();

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
    <div className="lg:p-6 p-3">
      <div className="flex items-center gap-2 max-w-sm lg:pt-6 p-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl">Update your profile</h1>
      </div>
      <p className="mb-8 lg:pt-0 pt-5 lg:pl-10 pl-0 text-muted-foreground">
        You can choose avatars and update your profile name at any time.
      </p>

      <div className="">
        <div className="lg:mx-12 mx-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <FormLabel>Avatar</FormLabel>
                <button
                  type="button"
                  onClick={() => setAvatarDialogOpen(true)}
                  disabled={isUpdating}
                  className="group flex rounded-xl items-center gap-4 p-3 border bg-muted/30 hover:bg-muted/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UserAvatar
                    src={data?.user?.image || ""}
                    alt={data?.user?.name || "User"}
                    size="lg"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {data?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Click avatar to change
                    </p>
                  </div>
                </button>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your display name for your account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your email address for login and notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isUpdating}
              >
                {form.formState.isSubmitting || isUpdating
                  ? "Updating..."
                  : "Update Profile"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <AvatarSelectorDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        currentAvatarUrl={data?.user?.image || ""}
        onAvatarSelect={handleAvatarSelect}
        isLoading={isUpdating}
      />
    </div>
  );
}
