import {
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { professions } from "../../data/professions";

export default function BasicInformation({
  formData,
  onChange,
  onAddressFieldChange,
  locationHierarchy,
  onProfessionChange,
}) {
  const countries = Array.isArray(locationHierarchy?.countries) ? locationHierarchy.countries : ["India"];
  const states = Array.isArray(locationHierarchy?.states) ? locationHierarchy.states : [];
  const districts = Array.isArray(locationHierarchy?.districts) ? locationHierarchy.districts : [];
  const cities = Array.isArray(locationHierarchy?.cities) ? locationHierarchy.cities : [];
  const localities = Array.isArray(locationHierarchy?.localities) ? locationHierarchy.localities : [];
  const postOffices = Array.isArray(locationHierarchy?.postOffices) ? locationHierarchy.postOffices : [];
  const pinCodes = Array.isArray(locationHierarchy?.postalCodes)
    ? locationHierarchy.postalCodes
    : (Array.isArray(locationHierarchy?.pinCodes) ? locationHierarchy.pinCodes : []);
  const fields = locationHierarchy?.fields || {
    visibility: {
      state: true,
      district: true,
      city: true,
      locality: false,
      postOffice: true,
      postalCode: true,
    },
    labels: {
      state: "State / Province / Region",
      district: "District / County / Prefecture",
      city: "City / Town / Municipality",
      locality: "Locality / Village",
      postOffice: "Post Office",
      postalCode: "Postal Code / ZIP Code",
    },
  };

  const updateAddress = (name, value) => {
    if (typeof onAddressFieldChange === "function") {
      onAddressFieldChange(name, value);
      return;
    }
    onChange({ target: { name, value } });
  };

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Basic Information
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <TextField
            required
            fullWidth
            name="name"
            label="Full Name / Organisation Name"
            value={formData.name}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            required
            fullWidth
            name="mobile"
            label="Mobile Number"
            type="tel"
            inputProps={{ maxLength: 10 }}
            value={formData.mobile}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="whatsapp"
            label="WhatsApp Number"
            type="tel"
            inputProps={{ maxLength: 10 }}
            value={formData.whatsapp}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            required
            fullWidth
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            required
            fullWidth
            select
            name="memberType"
            label="Member Type"
            value={formData.memberType}
            onChange={onChange}
          >
            <MenuItem value="individual">Individual</MenuItem>
            <MenuItem value="organisation">Organisation</MenuItem>
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="profession"
            label="Profession"
            value={formData.profession}
            onChange={onProfessionChange}
          >
            {professions.map((item) => (
              <MenuItem key={item.id} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="organisation"
            label="Organisation Name"
            value={formData.organisation}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            select
            name="gender"
            label="Gender"
            value={formData.gender}
            onChange={onChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="dob"
            label="Date of Birth"
            type="date"
            value={formData.dob}
            onChange={onChange}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>



        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="aadhar"
            label="Aadhar Number"
            inputProps={{ maxLength: 12 }}
            value={formData.aadhar}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="pan"
            label="PAN Number"
            inputProps={{ maxLength: 10 }}
            value={formData.pan}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="gst"
            label="GST Number"
            value={formData.gst}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            name="address"
            label="Address Line 1"
            value={formData.address}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            fullWidth
            name="address_line2"
            label="Address Line 2"
            value={formData.address_line2 || ""}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            name="landmark"
            label="Landmark"
            value={formData.landmark || ""}
            onChange={onChange}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <TextField
            fullWidth
            select
            name="country"
            label="Country"
            value={formData.country || ""}
            onChange={(event) => updateAddress("country", event.target.value)}
          >
            <MenuItem value="">Select Country</MenuItem>
            {countries.map((item) => (
              <MenuItem key={item} value={item}>{item}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid xs={12} md={4}>
          <TextField
            fullWidth
            select={states.length > 0}
            name="state"
            label={fields.labels.state}
            value={formData.state}
            onChange={(event) => updateAddress("state", event.target.value)}
          >
            {states.length > 0 ? <MenuItem value="">Select {fields.labels.state}</MenuItem> : null}
            {states.map((item) => (
              <MenuItem key={item} value={item}>{item}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {fields.visibility.district ? (
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              select={districts.length > 0}
              name="district"
              label={fields.labels.district}
              value={formData.district}
              onChange={(event) => updateAddress("district", event.target.value)}
            >
              {districts.length > 0 ? <MenuItem value="">Select {fields.labels.district}</MenuItem> : null}
              {districts.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : null}

        <Grid xs={12} md={4}>
          <TextField
            fullWidth
            select={cities.length > 0}
            name="city"
            label={fields.labels.city}
            value={formData.city}
            onChange={(event) => updateAddress("city", event.target.value)}
          >
            {cities.length > 0 ? <MenuItem value="">Select {fields.labels.city}</MenuItem> : null}
            {cities.map((item) => (
              <MenuItem key={item} value={item}>{item}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {fields.visibility.locality ? (
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              select={localities.length > 0}
              name="locality"
              label={fields.labels.locality}
              value={formData.locality || ""}
              onChange={(event) => updateAddress("locality", event.target.value)}
            >
              {localities.length > 0 ? <MenuItem value="">Select {fields.labels.locality}</MenuItem> : null}
              {localities.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : null}

        {fields.visibility.postOffice ? (
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              select={postOffices.length > 0}
              name="post_office"
              label={fields.labels.postOffice}
              value={formData.post_office || ""}
              onChange={(event) => updateAddress("post_office", event.target.value)}
            >
              {postOffices.length > 0 ? <MenuItem value="">Select {fields.labels.postOffice}</MenuItem> : null}
              {postOffices.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
        ) : null}

        <Grid xs={12} md={4}>
          {pinCodes.length > 1 ? (
            <TextField
              fullWidth
              select
              name="postal_code"
              label={fields.labels.postalCode}
              value={formData.postal_code || formData.pincode || ""}
              onChange={(event) => {
                updateAddress("postal_code", event.target.value);
                updateAddress("pincode", event.target.value);
              }}
            >
              <MenuItem value="">Select {fields.labels.postalCode}</MenuItem>
              {pinCodes.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              name="postal_code"
              label={fields.labels.postalCode}
              value={formData.postal_code || formData.pincode || ""}
              onChange={(event) => {
                updateAddress("postal_code", event.target.value);
                updateAddress("pincode", event.target.value);
              }}
              helperText={pinCodes.length === 0 ? "Manual entry enabled when postal master data is unavailable." : "Auto-selected from master data."}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}


