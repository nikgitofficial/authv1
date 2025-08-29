import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { AuthContext } from "../context/AuthContext";

const QuestionCreator = () => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ text: "", options: "", answer: "" }]);
  const [shareLink, setShareLink] = useState("");
  const [mySets, setMySets] = useState([]);
  const [filteredSets, setFilteredSets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editSet, setEditSet] = useState(null);
  const [deleteSet, setDeleteSet] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ New state for green success loader
  const [successLoading, setSuccessLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchSets = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await axios.get("/question-sets");
        setMySets(res.data);
        setFilteredSets(res.data);
      } catch (err) {
        console.error("Error fetching sets:", err);
        alert("Unauthorized. Please login.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSets();
  }, [user]);

  // Filter sets whenever searchQuery or mySets change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSets(mySets);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = mySets.filter(
        (set) =>
          set.title.toLowerCase().includes(q) ||
          set.questions.some((ques) => ques.text.toLowerCase().includes(q))
      );
      setFilteredSets(filtered);
    }
  }, [searchQuery, mySets]);

  const handleChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: "", answer: "" }]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let res;
      if (editSet) {
        res = await axios.put(`/question-sets/${editSet._id}`, {
          title,
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options.split(",").map((o) => o.trim()),
            answer: q.answer,
          })),
        });
        setMySets((prev) =>
          prev.map((s) => (s._id === editSet._id ? res.data : s))
        );
        setEditSet(null);
        setEditDialogOpen(false);
        window.dispatchEvent(new Event("questionSetsUpdated"));
      } else {
        res = await axios.post("/question-sets", {
          title,
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options.split(",").map((o) => o.trim()),
            answer: q.answer,
          })),
          isPublic: true,
        });
        setShareLink(`${window.location.origin}/set/${res.data.slug}`);
        setMySets((prev) => [...prev, res.data]);
        setCreateDialogOpen(false);
        window.dispatchEvent(new Event("questionSetsUpdated"));

        // ✅ Show green loader for 1 second after creation
        setSuccessLoading(true);
        setTimeout(() => setSuccessLoading(false), 1000);
      }
      setTitle("");
      setQuestions([{ text: "", options: "", answer: "" }]);
    } catch (err) {
      console.error(err);
      alert("Error saving set");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (set) => {
    setDeleteSet(set);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteSet) return;
    setLoading(true);
    try {
      await axios.delete(`/question-sets/${deleteSet._id}`);
      setMySets((prev) => prev.filter((s) => s._id !== deleteSet._id));
      setDeleteDialogOpen(false);
      setDeleteSet(null);
      window.dispatchEvent(new Event("questionSetsUpdated"));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting set");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (set) => {
    setEditSet(set);
    setTitle(set.title);
    setQuestions(
      set.questions.map((q) => ({
        text: q.text,
        options: q.options.join(", "),
        answer: q.answer,
      }))
    );
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Question Sets
        </Typography>
      </Stack>

      {/* Filter/Search + Create button side by side */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextField
          label="Search by set title or question"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: isMobile ? "100%" : "auto", flexGrow: 1, maxWidth: 400 }}
          size="small"
        />
        <Tooltip title="Create a new question set">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 3, px: 3, whiteSpace: "nowrap" }}
            onClick={() => { setCreateDialogOpen(true); setShareLink(""); }}
          >
            Create Set
          </Button>
        </Tooltip>
      </Box>

      {/* ✅ Green loader after creating a set */}
      {successLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress size={40} sx={{ color: "green" }} />
        </Box>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={50} />
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
  <Table>
    <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
      <TableRow>
        <TableCell><b>Set Name</b></TableCell>
        <TableCell><b>Question</b></TableCell>
        <TableCell><b>Choices</b></TableCell>
        <TableCell><b>Correct Answer</b></TableCell>
        <TableCell><b>Created Date</b></TableCell>
        <TableCell><b>Actions</b></TableCell>
        <TableCell><b>Link</b></TableCell>
      </TableRow>
    </TableHead>
  <TableBody>
  {filteredSets.map((set) => (
    <TableRow key={set._id} hover>
      {/* Set Name */}
      <TableCell>{set.title}</TableCell>

      {/* Questions */}
      <TableCell>
        {set.questions.map((q, idx) => (
          <div key={idx}>
            {idx + 1}. {q.text}
          </div>
        ))}
      </TableCell>

      {/* Options */}
      <TableCell>
        {set.questions.map((q, idx) => (
          <div key={idx}>
            {idx + 1}. {q.options.join(", ")}
          </div>
        ))}
      </TableCell>

      {/* Answers */}
      <TableCell>
        {set.questions.map((q, idx) => (
          <div key={idx}>
            {idx + 1}. {q.answer}
          </div>
        ))}
      </TableCell>

      {/* Created Date */}
      <TableCell>{set.createdAt ? new Date(set.createdAt).toLocaleDateString() : "-"}</TableCell>

      {/* Actions */}
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit this set">
            <IconButton onClick={() => handleEdit(set)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete this set">
            <IconButton onClick={() => confirmDelete(set)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>

      {/* Link */}
      <TableCell>
        <Tooltip title="Open this set in a new tab">
          <a href={`${window.location.origin}/set/${set.slug}`} target="_blank" rel="noopener noreferrer">
            Open
          </a>
        </Tooltip>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

  </Table>
</TableContainer>

      {/* Create / Edit Dialog */}
      {["Create", "Edit"].map((mode, idx) => {
        const open = mode === "Create" ? createDialogOpen : editDialogOpen;
        const onClose = () => (mode === "Create" ? setCreateDialogOpen(false) : setEditDialogOpen(false));
        return (
          <Dialog key={idx} open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{mode} Question Set</DialogTitle>
            <DialogContent>
              <TextField
                label="Set Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Stack spacing={3}>
                {questions.map((q, idx) => (
                  <Paper key={idx} sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", transition: "all 0.3s", "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.1)" } }}>
                    <TextField
                      fullWidth
                      label={`Question #${idx + 1}`}
                      value={q.text}
                      onChange={(e) => handleChange(idx, "text", e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Options (comma separated)"
                      value={q.options}
                      onChange={(e) => handleChange(idx, "options", e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Answer"
                      value={q.answer}
                      onChange={(e) => handleChange(idx, "answer", e.target.value)}
                    />
                  </Paper>
                ))}
                <Tooltip title="Add a new question">
                  <Button sx={{ mt: 2 }} variant="outlined" onClick={addQuestion} startIcon={<AddIcon />}>
                    Add Question
                  </Button>
                </Tooltip>
              </Stack>
              {shareLink && (
                <Typography sx={{ mt: 3, wordBreak: "break-all" }}>
                  Shareable Link: <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Tooltip title="Cancel and close dialog">
                <Button onClick={onClose}>Cancel</Button>
              </Tooltip>
              <Tooltip title={mode === "Create" ? "Save this set" : "Update this set"}>
                <Button onClick={handleSubmit} variant="contained">
                  {mode === "Create" ? "Save" : "Update"}
                  {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Button>
              </Tooltip>
            </DialogActions>
          </Dialog>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Question Set</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{deleteSet?.title}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Cancel deletion">
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          </Tooltip>
          <Tooltip title="Confirm delete">
            <Button color="error" variant="contained" onClick={handleDelete} disabled={loading}>
              Delete
              {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionCreator;
