import { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function PasswordField(props) {
    const [visible, setVisible] = useState(false);

    return (
        <TextField
            {...props}
            type={visible ? "text" : "password"}
            slotProps={{
                ...props.slotProps,
                input: {
                    ...props.slotProps?.input,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                aria-label={visible ? "Hide password" : "Show password"}
                                aria-pressed={visible}
                                onClick={() => setVisible((current) => !current)}
                                onMouseDown={(event) => event.preventDefault()}
                            >
                                {visible ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}