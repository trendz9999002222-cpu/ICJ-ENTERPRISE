import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControlLabel,
  Switch,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import AIService from "../services/aiService";
import useAuth from "../hooks/useAuth";

export default function AIAssistant() {
  const { profile, user } = useAuth();
  const role = String(profile?.role || user?.role || "member").toLowerCase();
  const permissions = AIService.getPermissions(role);

  const [config, setConfig] = useState(AIService.getConfiguration());
  const [flags, setFlags] = useState(AIService.getFeatureFlags());
  const [modules, setModules] = useState(AIService.getModules());
  const [prompts, setPrompts] = useState(AIService.getPrompts());
  const [history, setHistory] = useState(AIService.getRequestHistory(role));
  const [logs, setLogs] = useState(AIService.getLogs(role));

  const [requestForm, setRequestForm] = useState({
    moduleId: "membership",
    promptId: "",
    promptText: "",
  });
  const [newPrompt, setNewPrompt] = useState({
    name: "",
    moduleId: "membership",
    promptText: "",
  });

  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadFoundationData = useCallback((activeRole = role) => {
    setConfig(AIService.getConfiguration());
    setFlags(AIService.getFeatureFlags());
    setModules(AIService.getModules());
    setPrompts(AIService.getPrompts());
    setHistory(AIService.getRequestHistory(activeRole));
    setLogs(AIService.getLogs(activeRole));
  }, [role, setConfig, setFlags, setModules, setPrompts, setHistory, setLogs]);

  useEffect(() => {
    Promise.resolve().then(() => loadFoundationData(role));
  }, [loadFoundationData, role]);

  const promptOptions = useMemo(
    () => prompts.filter((item) => item.moduleId === requestForm.moduleId),
    [prompts, requestForm.moduleId]
  );

  const onRequestChange = (event) => {
    const { name, value } = event.target;
    if (name === "moduleId") {
      setRequestForm((prev) => ({ ...prev, moduleId: value, promptId: "" }));
      return;
    }
    if (name === "promptId") {
      const selected = prompts.find((item) => item.id === value);
      setRequestForm((prev) => ({
        ...prev,
        promptId: value,
        promptText: selected?.promptText || prev.promptText,
      }));
      return;
    }
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const runFoundationRequest = async () => {
    if (!requestForm.promptText.trim()) {
      alert("Prompt is required.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await AIService.request(
        {
          moduleId: requestForm.moduleId,
          promptId: requestForm.promptId,
          promptText: requestForm.promptText,
          context: {
            actorId: profile?.id || user?.id || "",
            actorRole: role,
          },
        },
        role
      );
      setResponse(result.output || "No response generated.");
      loadFoundationData();
    } catch (error) {
      setResponse(error.message || "Unable to generate response.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AIService.saveConfiguration(config, role);
      Object.entries(flags).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          AIService.setFeatureFlag(key, value, role);
        }
      });
      loadFoundationData();
      alert("AI settings saved.");
    } catch (error) {
      alert(error.message || "Unable to save AI settings.");
    }
  };

  const createPrompt = async () => {
    try {
      await AIService.createPrompt(newPrompt, role);
      setNewPrompt({ name: "", moduleId: requestForm.moduleId, promptText: "" });
      loadFoundationData();
    } catch (error) {
      alert(error.message || "Unable to create prompt.");
    }
  };

  const toggleModule = async (moduleId, enabled) => {
    try {
      await AIService.updateModule(moduleId, { enabled }, role);
      loadFoundationData();
    } catch (error) {
      alert(error.message || "Unable to update module.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        AI Foundation Console
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Launch mode foundation only. External AI providers, OCR, legal reasoning, prediction, chatbot, and automation are disabled by design.
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Settings and Flags
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(config.enabled)}
                    onChange={(event) => setConfig((prev) => ({ ...prev, enabled: event.target.checked }))}
                    disabled={!permissions.canManageSettings}
                  />
                }
                label="Enable AI foundation"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(flags.requestHistoryEnabled)}
                    onChange={(event) => setFlags((prev) => ({ ...prev, requestHistoryEnabled: event.target.checked }))}
                    disabled={!permissions.canManageSettings}
                  />
                }
                label="Enable request history"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(flags.promptManagerEnabled)}
                    onChange={(event) => setFlags((prev) => ({ ...prev, promptManagerEnabled: event.target.checked }))}
                    disabled={!permissions.canManageSettings}
                  />
                }
                label="Enable prompt manager"
              />
              <TextField
                fullWidth
                label="Default Provider"
                value={config.defaultProvider}
                disabled
                sx={{ mt: 1 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Prompt Length"
                value={config.maxPromptLength}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    maxPromptLength: Number(event.target.value || 0),
                  }))
                }
                disabled={!permissions.canManageSettings}
              />
              <Button variant="contained" onClick={saveSettings} disabled={!permissions.canManageSettings}>
                Save AI Settings
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              AI Module Registration
            </Typography>
            {modules.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Switch
                    checked={Boolean(item.enabled)}
                    onChange={(event) => toggleModule(item.id, event.target.checked)}
                    disabled={!permissions.canManageSettings}
                  />
                }
                label={`${item.name} (${item.id})`}
              />
            ))}
          </Paper>
        </Grid>

        <Grid xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Request Runner
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                select
                label="Module"
                name="moduleId"
                value={requestForm.moduleId}
                onChange={onRequestChange}
              >
                {modules.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Prompt Template"
                name="promptId"
                value={requestForm.promptId}
                onChange={onRequestChange}
              >
                <MenuItem value="">Custom Prompt</MenuItem>
                {promptOptions.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                multiline
                rows={5}
                label="Prompt"
                name="promptText"
                value={requestForm.promptText}
                onChange={onRequestChange}
                placeholder="Foundation request prompt..."
              />

              <Button variant="contained" onClick={runFoundationRequest} disabled={submitting || !permissions.canUseAI}>
                {submitting ? "Running..." : "Run Foundation Request"}
              </Button>

              <Paper variant="outlined" sx={{ p: 2, minHeight: 160, bgcolor: "#fafafa" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Foundation Output
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{response || "AI foundation output will appear here."}</Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prompt Manager
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Prompt Name"
                value={newPrompt.name}
                onChange={(event) => setNewPrompt((prev) => ({ ...prev, name: event.target.value }))}
                disabled={!permissions.canManagePrompts}
              />
              <TextField
                fullWidth
                select
                label="Prompt Module"
                value={newPrompt.moduleId}
                onChange={(event) => setNewPrompt((prev) => ({ ...prev, moduleId: event.target.value }))}
                disabled={!permissions.canManagePrompts}
              >
                {modules.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Prompt Text"
                value={newPrompt.promptText}
                onChange={(event) => setNewPrompt((prev) => ({ ...prev, promptText: event.target.value }))}
                disabled={!permissions.canManagePrompts}
              />
              <Button variant="outlined" onClick={createPrompt} disabled={!permissions.canManagePrompts}>
                Add Prompt
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No prompts configured.</TableCell>
                  </TableRow>
                ) : (
                  prompts.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.moduleId}</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Request History
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Provider</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No requests yet.</TableCell>
                  </TableRow>
                ) : (
                  history.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{item.moduleId}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.provider}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              AI Logs
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No logs available.</TableCell>
                  </TableRow>
                ) : (
                  logs.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{item.action}</TableCell>
                      <TableCell>{item.moduleId}</TableCell>
                      <TableCell>{item.level}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

