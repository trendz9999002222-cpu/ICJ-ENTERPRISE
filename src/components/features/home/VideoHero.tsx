"use client";

import { Box, Container, Typography } from "@mui/material";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { PAGE_TOP_OFFSET } from "@/constants/layout";

type VideoHeroProps = {
  children: ReactNode;
};

export default function VideoHero({ children }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const updatePin = () => {
      const slot = slotRef.current;
      if (!slot) return;
      setPinned(slot.getBoundingClientRect().top <= 0);
    };

    updatePin();
    window.addEventListener("scroll", updatePin, { passive: true });
    window.addEventListener("resize", updatePin);
    return () => {
      window.removeEventListener("scroll", updatePin);
      window.removeEventListener("resize", updatePin);
    };
  }, []);

  return (
    <Box className="video-story" sx={{ position: "relative" }}>
      <Box
        ref={slotRef}
        className="video-story__slot"
        sx={{ position: "relative", height: "100dvh" }}
      >
        <Box
          component="section"
          className="video-story__stage"
          aria-label="ICJ video story"
          sx={{
            position: pinned ? "fixed" : "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100dvh",
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <Box
            component="video"
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100% !important",
              maxWidth: "none",
              objectFit: "cover",
            }}
          >
            <source src="/vidoes/landing_pageVidoe.mp4" type="video/mp4" />
          </Box>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.28) 0%, rgba(15,23,42,0.38) 45%, rgba(15,23,42,0.55) 100%)",
            }}
          />
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            pointerEvents: "none",
            pb: { xs: 8, md: 12 },
            pt: {
              xs: `${PAGE_TOP_OFFSET.xs + 24}px`,
              sm: `${PAGE_TOP_OFFSET.sm + 24}px`,
              md: `${PAGE_TOP_OFFSET.md + 24}px`,
              lg: `${PAGE_TOP_OFFSET.lg + 24}px`,
            },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "#fbbf24",
              letterSpacing: "0.18em",
              fontWeight: 800,
              mb: 1.5,
            }}
          >
            ICJ Enterprise
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontWeight: 900,
              lineHeight: 1.2,
              maxWidth: 720,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
              textShadow: "0 12px 40px rgba(15,23,42,0.35)",
            }}
          >
            न्याय व्यवस्था का जीवंत दृश्य
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              color: "rgba(248,250,252,0.88)",
              maxWidth: 560,
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              lineHeight: 1.7,
            }}
          >
            140 करोड़ नागरिकों, अधिवक्ताओं और ज़िला केंद्रों के लिए अखिल भारतीय स्तर पर पारदर्शी।
          </Typography>
        </Container>
      </Box>

      <Box
        className="video-story__overlay"
        sx={{
          position: "relative",
          zIndex: 2,
          bgcolor: "transparent",
          pt: { xs: 3, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
