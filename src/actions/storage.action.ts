"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type StorageActionResult<T> =
  | { status: "success"; data: T; errors: null }
  | { status: "error"; data: null; errors: { _form: string[] } };

export async function uploadFile(
  bucket: string,
  folder: string,
  file: File,
  oldFilePath?: string,
): Promise<StorageActionResult<{ url: string; path: string }>> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      status: "error",
      data: null,
      errors: { _form: ["File size must not exceed 1 MB"] },
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      status: "error",
      data: null,
      errors: { _form: ["File must be an image (JPEG, PNG, WEBP, or GIF)"] },
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      data: null,
      errors: { _form: ["You must be logged in"] },
    };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${folder}/${user.id}/avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return {
      status: "error",
      data: null,
      errors: { _form: [uploadError.message] },
    };
  }

  // Hapus file lama supaya storage tidak menumpuk
  if (oldFilePath) {
    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove([oldFilePath]);

    if (removeError) {
      console.error("Gagal hapus avatar lama:", removeError.message);
    }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    status: "success",
    data: { url: publicUrl, path: filePath },
    errors: null,
  };
}

export async function deleteFile(
  bucket: string,
  filePath: string,
): Promise<StorageActionResult<null>> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    return {
      status: "error",
      data: null,
      errors: { _form: [error.message] },
    };
  }

  return { status: "success", data: null, errors: null };
}
