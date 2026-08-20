import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";

export default function CameraDocumentScanner({ open, onClose, onDocumentCaptured }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "user" | "environment"
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const startCamera = async (mode = facingMode) => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn("Camera access warning:", err);
      setErrorMsg("Camera access permission required. Please allow camera access in browser.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedImage(dataUrl);

    // Stop video stream after capture
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmSend = () => {
    if (capturedImage && onDocumentCaptured) {
      onDocumentCaptured({
        id: `DOC-CAM-${Date.now()}`,
        name: `Camera_Captured_Doc_${new Date().toLocaleTimeString().replace(/:/g, "-")}.jpg`,
        dataUrl: capturedImage,
        capturedAt: new Date().toISOString(),
        type: "Camera Scan",
      });
    }
    handleClose();
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCapturedImage(null);
    onClose();
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth paperProps={{ style: { borderRadius: 16 } }}>
      <DialogTitle sx={{ bgcolor: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CameraAltIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            📷 HD Camera Document Scanner
          </Typography>
        </Stack>
        <IconButton size="small" onClick={handleClose} sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "#020617", p: 2, textAlign: "center" }}>
        {errorMsg ? (
          <Box sx={{ p: 4, color: "#ef4444" }}>
            <Typography variant="body1" fontWeight="bold">{errorMsg}</Typography>
            <Button variant="outlined" color="primary" onClick={() => startCamera()} sx={{ mt: 2 }}>
              Retry Camera Permission
            </Button>
          </Box>
        ) : capturedImage ? (
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "2px solid #38bdf8" }}>
            <img src={capturedImage} alt="Captured Legal Document" style={{ width: "100%", maxHeight: "60vh", objectFit: "contain" }} />
            <Chip
              label="Ready to Send to Advocate"
              color="success"
              icon={<CheckCircleIcon />}
              sx={{ position: "absolute", top: 12, right: 12, fontWeight: "bold" }}
            />
          </Box>
        ) : (
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", bgcolor: "#000", minHeight: 320 }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
                <CircularProgress color="info" />
              </Box>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", maxHeight: "60vh", objectFit: "cover" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Viewfinder overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                right: 20,
                bottom: 20,
                border: "2px dashed rgba(56, 189, 248, 0.7)",
                borderRadius: 2,
                pointerEvents: "none",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 1,
              }}
            >
              <Chip label="Align Legal Document Within Frame" size="small" sx={{ bgcolor: "rgba(15, 23, 42, 0.8)", color: "#38bdf8" }} />
            </Box>

            {/* Flip Camera button */}
            <IconButton
              onClick={toggleCameraFacing}
              sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}
            >
              <FlipCameraIosIcon />
            </IconButton>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: "#0f172a", p: 2, justifyContent: "space-between" }}>
        {capturedImage ? (
          <>
            <Button variant="outlined" color="secondary" startIcon={<RefreshIcon />} onClick={handleRetake}>
              Retake Photo
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleConfirmSend}
              sx={{ fontWeight: "bold", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              Confirm & Send to Advocate 🚀
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" color="inherit" onClick={handleClose} sx={{ color: "#94a3b8" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleCapture}
              disabled={loading || !!errorMsg}
              startIcon={<CameraAltIcon />}
              sx={{
                fontWeight: "bold",
                px: 3,
                background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
                boxShadow: "0 4px 14px rgba(236, 72, 153, 0.4)",
              }}
            >
              Snap Photo Now
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
