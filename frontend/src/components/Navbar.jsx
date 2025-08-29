import React, { useState, useContext, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  Collapse,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sets, setSets] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // ✅ for dropdown

  const handleToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err.message);
    }
    logout();
    navigate("/login");
  };

  const fetchSets = async () => {
    if (!user) return;
    try {
      const res = await axios.get("/question-sets");
      setSets(res.data);
    } catch (err) {
      console.error("Error fetching question sets:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSets();
  }, [user]);

  // ✅ Listen for updates from QuestionCreator
  useEffect(() => {
    const handleUpdate = () => fetchSets();
    window.addEventListener("questionSetsUpdated", handleUpdate);
    return () => window.removeEventListener("questionSetsUpdated", handleUpdate);
  }, [user]);

  const menuItems = !user
    ? [
        { text: "Home", path: "/publichome" },
        { text: "About", path: "/about" },
        { text: "Register", path: "/register" },
      ]
    : [
        { text: "Home", path: "/home" },
        { text: "Create Question", path: "/create-question" },
        {
          text: "Answers",
          children: sets.map((set) => ({
            text: set.title,
            path: `/all-answers/${set.slug}`,
          })),
        },
        { text: "Logout", action: handleLogout },
      ];

  const navButtonStyles = {
    color: "#FFFFFF",
    fontWeight: 600,
    position: "relative",
    textTransform: "none",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "0%",
      height: "2px",
      bottom: 8,
      left: 0,
      bgcolor: "#FFD700",
      transition: "width 0.3s ease",
    },
    "&:hover::after": {
      width: "100%",
    },
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#2e7d32",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          borderRadius: "0 0 30px 30px",
          margin: "0 10px",
          width: "calc(100% - 20px)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={Link}
            to={user ? "/home" : "/login"}
            sx={{
              textDecoration: "none",
              color: "#FFFFFF",
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            MyApp
          </Typography>

          {/* Desktop Menu */}
          <Stack direction="row" spacing={2} sx={{ display: { xs: "none", md: "flex" } }}>
            {menuItems.map((item, index) =>
              item.children ? (
                <div
                  key={index}
                  onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                  onMouseLeave={() => setAnchorEl(null)}
                >
                  <Button
                    sx={navButtonStyles}
                    disableRipple
                  >
                    {item.text}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    MenuListProps={{
                      onMouseEnter: () => setAnchorEl(anchorEl),
                      onMouseLeave: () => setAnchorEl(null),
                    }}
                  >
                    {item.children.map((child, idx) => (
                      <MenuItem
                        key={idx}
                        component={Link}
                        to={child.path}
                        onClick={() => setAnchorEl(null)}
                      >
                        {child.text}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              ) : item.action ? (
                <Button key={index} onClick={item.action} sx={navButtonStyles}>
                  {item.text}
                </Button>
              ) : (
                <Button key={index} component={Link} to={item.path} sx={navButtonStyles}>
                  {item.text}
                </Button>
              )
            )}
          </Stack>

          {/* Mobile Menu Toggle */}
          <IconButton color="inherit" edge="end" sx={{ display: { md: "none" } }} onClick={handleToggle}>
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* Mobile Collapse Menu */}
        <Collapse in={mobileOpen} timeout="auto" unmountOnExit>
          <Box sx={{ bgcolor: "#2e7d32", p: 2 }}>
            <Stack spacing={1}>
              {menuItems.map((item, index) =>
                item.children ? (
                  <Box key={index}>
                    <Typography sx={{ color: "#FFD700", fontWeight: 700, mb: 1 }}>
                      {item.text}
                    </Typography>
                    {item.children.map((child, idx) => (
                      <Button
                        key={idx}
                        fullWidth
                        component={Link}
                        to={child.path}
                        onClick={handleToggle}
                        sx={{ ...navButtonStyles, justifyContent: "flex-start" }}
                      >
                        {child.text}
                      </Button>
                    ))}
                  </Box>
                ) : item.action ? (
                  <Button
                    key={index}
                    fullWidth
                    onClick={() => {
                      item.action();
                      handleToggle();
                    }}
                    sx={{ ...navButtonStyles, justifyContent: "flex-start" }}
                  >
                    {item.text}
                  </Button>
                ) : (
                  <Button
                    key={index}
                    fullWidth
                    component={Link}
                    to={item.path}
                    onClick={handleToggle}
                    sx={{ ...navButtonStyles, justifyContent: "flex-start" }}
                  >
                    {item.text}
                  </Button>
                )
              )}
            </Stack>
          </Box>
        </Collapse>
      </AppBar>
    </>
  );
};

export default Navbar;
