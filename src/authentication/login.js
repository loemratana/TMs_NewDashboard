import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import tmsLogo from "../assets/TMS-LOGO.png";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const navigate = useNavigate();

    const handleLogin = async () => {
        // Reset field-specific errors
        setUsernameError("");
        setPasswordError("");

        // Validate fields
        let isValid = true;
        if (!username.trim()) {
            setUsernameError("Username is required");
            isValid = false;
        }
        if (!password.trim()) {
            setPasswordError("Password is required");
            isValid = false;
        }

        // If validation fails, stop here
        if (!isValid) return;

        try {
            const response = await axios.post("https://tms-backend-server.onrender.com/api/users/login", {
                username: username.trim(),
                password: password.trim(),
            });

            if (response.data.success) {
                const loggedInUser = {
                    id: response.data.user.id,
                    username: response.data.user.username,
                    role: response.data.user.role,
                    department: response.data.user.department,
                    image: response.data.user.image,
                };

                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(loggedInUser));
                onLogin(loggedInUser);
                navigate("/dashboard");
            } else {
                setPasswordError("Invalid credentials");
            }
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Login failed");
        }
    };

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    padding: 4,
                    borderRadius: 2,
                    width: "100%",
                    maxWidth: 400,
                    textAlign: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <img src={tmsLogo} alt="Logo" style={{ width: "200px", marginBottom: "40px" }} />
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
                    Welcome Back
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: "#666" }}>
                    Medai GB Enterprise Co,LTD
                </Typography>

                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 2 }}
                    error={!!usernameError}
                    helperText={usernameError}
                />
                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"} // Toggle between text and password
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 3 }}
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                    sx={{ color: "#6a11cb" }} // Customize icon color
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />} {/* Toggle icon */}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleLogin}
                    sx={{
                        mt: 2,
                        py: 1.5,
                        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                        color: "#fff",
                        fontWeight: "bold",
                        "&:hover": {
                            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                        },
                    }}
                >
                    Login
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;

//correct with 165 line code changes
