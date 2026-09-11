import { Box } from "@mui/material";

import GatewayCards from "@/components/features/home/GatewayCards";
import HeroSection from "@/components/features/home/HeroSection";
import JudiciaryNetworkSection from "@/components/features/home/JudiciaryNetworkSection";
import QuickUtilitiesBar from "@/components/features/home/QuickUtilitiesBar";
import VideoHero from "@/components/features/home/VideoHero";

export default function HomePage() {
  return (
    <Box sx={{ flex: 1, bgcolor: "#f8fafc", color: "#0f172a" }}>
      <HeroSection />
      <QuickUtilitiesBar />
      <GatewayCards />
 
      <VideoHero>
        <JudiciaryNetworkSection />
      </VideoHero>
    </Box>
  );
}
