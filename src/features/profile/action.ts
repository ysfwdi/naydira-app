"use server";

import { deleteFile, uploadFile } from "@/actions/storage.action";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/validations/profile-validations";
import { revalidatePath } from "next/cache";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Failed to fetch user profile");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || "",
    avatarUrl: user.user_metadata?.avatar_url || null,
  };
}

export async function updateProfile(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    avatar_url: formData.get("avatar_url"),
  };

  const validateFields = updateProfileSchema.safeParse(raw);

  if (!validateFields.success) {
    const message = Object.values(
      validateFields.error.flatten().fieldErrors,
    ).flat()[0];
    throw new Error(message || "Invalid input");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in");
  }

  let avatarUrl: string | undefined;

  if (validateFields.data.avatar_url instanceof File) {
    const oldAvatarUrl = formData.get("old_avatar_url") as string;
    const oldPath = oldAvatarUrl?.split("/images/")[1];

    const { status, errors, data } = await uploadFile(
      "images",
      "users",
      validateFields.data.avatar_url,
      oldPath,
    );

    if (status === "error") {
      throw new Error(errors._form[0] || "Failed to upload avatar");
    }

    avatarUrl = data.url;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      name: validateFields.data.name,
      ...(avatarUrl && { avatar_url: avatarUrl }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/profile");

  return { name: validateFields.data.name, avatarUrl };
}

export async function updatePassword({ newPassword }: { newPassword: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return "Password updated successfully";
}
