"use client";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { Box, Button, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { JOIN_US_GOOGLE_FORM_URL } from "@/config/siteLinks";

const STORAGE_KEY = "icj-floating-join-us-position";
const DRAG_THRESHOLD_PX = 6;

type Position = { x: number; y: number };

function readStoredPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function defaultPosition(widgetW: number, widgetH: number): Position {
  const margin = 12;
  return {
    x: Math.max(margin, window.innerWidth - widgetW - margin),
    y: margin,
  };
}

function clampPosition(pos: Position, widgetW: number, widgetH: number): Position {
  const margin = 8;
  const maxX = window.innerWidth - widgetW - margin;
  const maxY = window.innerHeight - widgetH - margin;
  return {
    x: Math.max(margin, Math.min(pos.x, maxX)),
    y: Math.max(margin, Math.min(pos.y, maxY)),
  };
}

export default function FloatingJoinUsWidget() {
  const href = JOIN_US_GOOGLE_FORM_URL.startsWith("http") ? JOIN_US_GOOGLE_FORM_URL : "#";
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const measureAndPlace = useCallback(() => {
    const el = widgetRef.current;
    const w = el?.offsetWidth ?? 148;
    const h = el?.offsetHeight ?? 44;
    const stored = readStoredPosition();
    const next = clampPosition(stored ?? defaultPosition(w, h), w, h);
    setPosition(next);
  }, []);

  useEffect(() => {
    measureAndPlace();
  }, [measureAndPlace]);

  useEffect(() => {
    const onResize = () => {
      const el = widgetRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setPosition((prev) => (prev ? clampPosition(prev, w, h) : prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const persistPosition = (pos: Position) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
      /* ignore */
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (position === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || position === null) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      drag.moved = true;
    }

    const el = widgetRef.current;
    const w = el?.offsetWidth ?? 148;
    const h = el?.offsetHeight ?? 44;
    setPosition(clampPosition({ x: drag.originX + dx, y: drag.originY + dy }, w, h));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    e.currentTarget.releasePointerCapture(e.pointerId);

    const el = widgetRef.current;
    const w = el?.offsetWidth ?? 148;
    const h = el?.offsetHeight ?? 44;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const finalPos = clampPosition(
      { x: drag.originX + dx, y: drag.originY + dy },
      w,
      h,
    );
    setPosition(finalPos);
    persistPosition(finalPos);

    dragRef.current = null;
    setIsDragging(false);

    if (!drag.moved && href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  if (position === null) {
    return (
      <Box
        ref={widgetRef}
        aria-hidden
        sx={{
          position: "fixed",
          visibility: "hidden",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <Button size="small" startIcon={<PersonAddAlt1Icon />}>Join Us</Button>
      </Box>
    );
  }

  return (
    <Box
      ref={widgetRef}
      role="group"
      aria-label="Join Us — drag to reposition, tap to open form"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1250,
        display: "flex",
        alignItems: "stretch",
        borderRadius: 2,
        overflow: "hidden",
        border: "2px solid #fbbf24",
        boxShadow: isDragging
          ? "0 12px 40px rgba(15, 41, 66, 0.35)"
          : "0 6px 24px rgba(180, 83, 9, 0.45)",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        bgcolor: "#b45309",
        transition: isDragging ? "none" : "box-shadow 0.2s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 0.6,
          bgcolor: "rgba(0,0,0,0.12)",
          color: "#fffbeb",
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 20 }} />
      </Box>
      <Button
        component="span"
        tabIndex={-1}
        startIcon={<PersonAddAlt1Icon sx={{ fontSize: "18px !important" }} />}
        sx={{
          pointerEvents: "none",
          bgcolor: "#b45309",
          color: "#ffffff",
          fontWeight: 800,
          fontSize: { xs: "0.75rem", sm: "0.8125rem" },
          textTransform: "none",
          px: { xs: 1.25, sm: 1.75 },
          py: 0.85,
          borderRadius: 0,
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "#b45309" },
        }}
      >
        Join Us
      </Button>
      <Typography
        component="span"
        sx={{
          display: { xs: "none", sm: "block" },
          alignSelf: "center",
          pr: 1,
          fontSize: "0.65rem",
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          whiteSpace: "nowrap",
        }}
      >
        Drag to move
      </Typography>
    </Box>
  );
}
