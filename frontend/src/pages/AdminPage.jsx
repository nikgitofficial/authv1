import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  CssBaseline,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert,
} from "@mui/material";
import {
  Dashboard,
  Group,
  Settings,
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const drawerWidth = 240;

const AdminPage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [sets, setSets] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err.message);
    }
    logout();
    navigate("/login");
  };

  // ✅ Fetch all data with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, setsRes, answersRes] = await Promise.all([
          axios.get("/users"),
          axios.get("/questions/all/sets"),
          axios.get("/questions/all/answers"),
        ]);
        setUsers(usersRes.data);
        setSets(setsRes.data);
        setAnswers(answersRes.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(
          err.response?.data?.msg ||
            "Failed to fetch admin data. Make sure you are logged in as admin."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Helper: count sets & answers per user (convert ObjectId to string)
  const getUserStats = (userId) => {
    const setsCount = sets.filter((s) => s.user?.toString() === userId.toString())
      .length;
    const answersCount = answers.filter(
      (a) => a.user?.toString() === userId.toString()
    ).length;
    return { setsCount, answersCount };
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button onClick={() => setSelectedPage("dashboard")}>
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => setSelectedPage("users")}>
          <ListItemIcon>
            <Group />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        <ListItem button onClick={() => setSelectedPage("settings")}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  // ✅ Content based on selectedPage
  const renderContent = () => {
    if (loading) return <CircularProgress />;

    if (error) return <Alert severity="error">{error}</Alert>;

    switch (selectedPage) {
      case "dashboard":
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Card sx={{ minWidth: 200, p: 2, boxShadow: 4 }}>
                  <CardContent>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h3" color="primary">
                      {users.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card sx={{ minWidth: 200, p: 2, boxShadow: 4 }}>
                  <CardContent>
                    <Typography variant="h6">Total Sets</Typography>
                    <Typography variant="h3" color="secondary">
                      {sets.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item>
                <Card sx={{ minWidth: 200, p: 2, boxShadow: 4 }}>
                  <CardContent>
                    <Typography variant="h6">Total Answers</Typography>
                    <Typography variant="h3" color="success.main">
                      {answers.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case "users":
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Users
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Username</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Role</b></TableCell>
                    <TableCell><b>Sets Created</b></TableCell>
                    <TableCell><b>Answers Submitted</b></TableCell>
                    <TableCell><b>Created At</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => {
                    const { setsCount, answersCount } = getUserStats(u._id);
                    return (
                      <TableRow key={u._id}>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell>{setsCount}</TableCell>
                        <TableCell>{answersCount}</TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case "settings":
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body1">
              Settings functionality will go here.
            </Typography>
          </Box>
        );

      default:
        return <Typography>Page not found.</Typography>;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: theme.palette.mode === "dark" ? "#222" : "#1976d2",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdminPage;
