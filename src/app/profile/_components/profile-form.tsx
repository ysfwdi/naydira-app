"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/features/profile/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function ProfileForm({
  profile,
  refetch,
}: {
  profile: {
    id: string;
    email?: string;
    name: string;
    avatarUrl: string | null;
  };
  refetch: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatarUrl,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: profile.name },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      const fd = new FormData();
      fd.append("name", data.name);
      if (avatarFile) {
        fd.append("avatar_url", avatarFile);
        fd.append("old_avatar_url", profile.avatarUrl || "");
      }
      return updateProfile(fd);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setAvatarFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    },
  });

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must not exceed 1 MB");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data);
  }

  return (
    <Card className="w-full gap-2 h-fit">
      <CardHeader className="gap-0">
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your name and avatar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <Avatar className="size-24">
                  <AvatarImage
                    src={previewUrl || undefined}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-0 bg-black/40 group-hover:opacity-100">
                  <CameraIcon className="text-white size-6" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                Click avatar to change photo
              </p>
            </div>

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="form-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="form-name"
                    placeholder="Your name"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field className="gap-1">
              <FieldLabel htmlFor="form-email">Email</FieldLabel>
              <Input id="form-email" value={profile.email} disabled />
            </Field>

            <Button size="lg" type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
