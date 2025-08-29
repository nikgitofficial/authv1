import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import axios from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordLabel, setPasswordLabel] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  // Password strength calculation
  useEffect(() => {
    const pwd = form.password;
    let score = 0;

    if (!pwd) {
      setPasswordStrength(0);
      setPasswordLabel("");
      return;
    }

    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&]/.test(pwd)) score += 1;

    setPasswordStrength((score / 5) * 100);

    if (score <= 2) setPasswordLabel("Weak");
    else if (score === 3) setPasswordLabel("Fair");
    else if (score === 4) setPasswordLabel("Good");
    else setPasswordLabel("Strong");
  }, [form.password]);

  // Check if username/email exists
  const checkExistence = async () => {
    try {
      const res = await axios.post("/auth/check", {
        username: form.username,
        email: form.email,
      });
      setErrors({
        username: res.data.usernameExists ? "Username already taken" : "",
        email: res.data.emailExists ? "Email already registered" : "",
      });

      return !(res.data.usernameExists || res.data.emailExists);
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username/email existence
    const valid = await checkExistence();
    if (!valid) return;

    try {
      await axios.post("/auth/register", form);
      setSnack({
        open: true,
        message: "✅ Registration successful! Redirecting...",
        severity: "success",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setSnack({
        open: true,
        message: "❌ Registration failed. Try again.",
        severity: "error",
      });
    }
  };

  const getPasswordColor = () => {
    if (passwordStrength < 40) return "#f87171";
    if (passwordStrength < 60) return "#facc15";
    if (passwordStrength < 80) return "#60a5fa";
    return "#4ade80";
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
          Create an Account
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />
            {form.password && (
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  sx={{
                    height: 8,
                    borderRadius: 2,
                    backgroundColor: "#e5e7eb",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getPasswordColor(),
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  mt={0.5}
                  fontWeight={600}
                  color={getPasswordColor()}
                >
                  {passwordLabel}
                </Typography>
              </Box>
            )}
            <Button type="submit" variant="contained" size="large" fullWidth>
              Register
            </Button>
            <Typography variant="body2" textAlign="center" mt={1}>
              Already have an account?{" "}
              <span
                style={{ color: "#1976d2", cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </Typography>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
