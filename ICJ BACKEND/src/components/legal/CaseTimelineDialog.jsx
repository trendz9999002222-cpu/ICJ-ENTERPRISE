import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Box,
} from "@mui/material";

export default function CaseTimelineDialog({ open, onClose, caseItem, timeline = [] }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Case Timeline{caseItem?.caseNumber ? ` - ${caseItem.caseNumber}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {timeline.length === 0 ? (
          <Typography color="text.secondary">No timeline activity available.</Typography>
        ) : (
          <List>
            {timeline.map((item) => (
              <Box key={item.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography fontWeight={600}>{item.title}</Typography>
                        <Chip size="small" label={item.eventType || "Update"} />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.detail || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.date || "-"}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
