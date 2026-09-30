"use client";

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Avatar, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";

import { env } from "@/config/env";
import { resolveMediaUrl } from "@/lib/mediaUrl";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

type ProfilePictureUploadProps = {
  profilePictureUrl?: string | null;
  initials: string;
  onUploaded?: (profilePictureUrl: string | null) => void;
  onError?: (message: string) => void;
  avatarSize?: number;
  variant?: "card" | "inline";
};

export default function ProfilePictureUpload({
  profilePictureUrl,
  initials,
  onUploaded,
  onError,
  avatarSize = 68,
  variant = "card",
}: ProfilePictureUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displaySrc = previewUrl || resolveMediaUrl(profilePictureUrl) || undefined;

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError?.("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onError?.("Image must be under 2 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    try {
      const token = readCookie("icj_access_token");
      const form = new FormData();
      form.append("profile_picture", file);
      const res = await fetch(`${env.apiUrl}/auth/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.errors?.profile_picture?.[0] ||
          json?.message ||
          "Failed to upload profile picture.";
        setPreviewUrl(null);
        onError?.(msg);
        return;
      }
      const data = json.data ?? json;
      setPreviewUrl(null);
      onUploaded?.(data.profile_picture_url ?? null);
    } catch {
      setPreviewUrl(null);
      onError?.("Network error while uploading photo.");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const content = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" } }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <Avatar
          src={displaySrc}
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "#059669",
            fontSize: avatarSize * 0.38,
            fontWeight: 800,
            boxShadow: "0 4px 6px -1px rgba(5,150,105,0.25)",
          }}
        >
          {initials}
        </Avatar>
        {uploading && (
          <CircularProgress
            size={avatarSize}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              color: "#059669",
            }}
          />
        )}
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Profile picture
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 1, maxWidth: 360 }}>
          JPG, PNG, or WebP. Max 2 MB. Shown on your member dashboard and profile.
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outlined"
          size="small"
          disabled={uploading}
          startIcon={<PhotoCameraIcon />}
          onClick={() => inputRef.current?.click()}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            borderColor: "#cbd5e1",
            color: "#0f172a",
            borderRadius: "8px",
          }}
        >
          {displaySrc ? "Change photo" : "Upload photo"}
        </Button>
      </Box>
    </Stack>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "10px",
        border: "1px dashed #cbd5e1",
        bgcolor: "#f8fafc",
      }}
    >
      {content}
    </Box>
  );
}
