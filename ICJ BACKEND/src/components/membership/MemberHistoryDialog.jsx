import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

export default function MemberHistoryDialog({ open, onClose, member, history }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Membership History{member?.name ? ` - ${member.name}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {!history?.length ? (
          <Typography color="text.secondary">No membership history available.</Typography>
        ) : (
          <List disablePadding>
            {history.map((item) => (
              <ListItem key={item.id} divider>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <span>{item.action || "Activity"}</span>
                      <Chip size="small" label={item.actorRole || "system"} />
                    </Stack>
                  }
                  secondary={`${item.message || "-"} | ${item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN") : "-"}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
