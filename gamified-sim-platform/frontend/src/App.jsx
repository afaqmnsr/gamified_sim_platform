import React, { useState, useContext } from 'react';
import axios from 'axios';
import { algorithms } from './constants/predefinedAlgorithms';
import AlgorithmSelector from './components/AlgorithmSelector';
import CustomAlgorithmEditor from './components/CustomAlgorithmEditor';
import ResultsDisplay from './components/ResultsDisplay';
import GraphVisualizer from './components/GraphVisualizer';
import Leaderboard from './components/Leaderboard';
import AssignmentList from './components/AssignmentList';
import AssignmentLeaderboard from './components/AssignmentLeaderboard';

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from './contexts/ThemeContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [userCustomCode, setUserCustomCode] = useState('');
  const [inputArray, setInputArray] = useState([]);
  const [graphInput, setGraphInput] = useState('');
  const [startNode, setStartNode] = useState('');
  const [results, setResults] = useState(null);
  const [scores, setScores] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentCode, setAssignmentCode] = useState('');
  const [reloadLeaderboard, setReloadLeaderboard] = useState(false);

  const [tabValue, setTabValue] = useState(0); // 0 = Simulator, 1 = Assignments
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'error' | 'success' | 'info'


  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleAlgorithmSelect = (algoId) => {
    const algo = algorithms.find((a) => a.id === algoId);
    if (!algo) return;

    setSelectedAlgorithm(algoId);
    setUserCustomCode(algo.code);

    if (algo.defaultInput) setInputArray(algo.defaultInput);
    if (algo.defaultGraph) setGraphInput(JSON.stringify(algo.defaultGraph, null, 2));
    if (algo.defaultStartNode) setStartNode(algo.defaultStartNode);
  };

  const handleRunAlgorithm = async () => {
    if (!selectedAlgorithm) {
      return showSnackbar('Please select an algorithm', 'warning');
    }
    if (!userCustomCode) {
      return showSnackbar('No algorithm code found!', 'warning');
    }

    let payload = {
      userCode: userCustomCode,
      inputData: inputArray,
      graph: selectedAlgorithm === 'bfs' ? JSON.parse(graphInput) : null,
      startNode: selectedAlgorithm === 'bfs' ? startNode : null
    };

    try {
      setIsRunning(true);
      const response = await axios.post('http://localhost:5000/run-user-algorithm', payload);

      setResults(response.data);
      setScores((prevScores) => [...prevScores, { name: 'Player', score: response.data.score }]);
      showSnackbar('Algorithm ran successfully!', 'success');
    } catch (error) {
      console.error('Error running algorithm:', error);
      showSnackbar(error.response?.data?.error || 'Unknown error occurred', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) {
      return showSnackbar('No assignment selected!', 'warning');
    }
    if (!assignmentCode) {
      return showSnackbar('Please provide your code!', 'warning');
    }

    try {
      setIsRunning(true);
      const response = await axios.post('http://localhost:5000/submit-assignment', {
        assignmentId: selectedAssignment.id,
        userCode: assignmentCode,
        username: 'Player'
      });

      showSnackbar(response.data.message, response.data.isCorrect ? 'success' : 'warning');

      // Trigger Leaderboard Reload
      setReloadLeaderboard(prev => !prev);
    } catch (error) {
      console.error('Assignment submission error:', error);
      showSnackbar(error.response?.data?.error || 'Unknown error occurred', 'error');
    } finally {
      setIsRunning(false);
    }

  };

  // Create Alert component
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary', position: 'relative' }}>
      {/* Dark Mode Toggle */}
      <IconButton
        onClick={colorMode.toggleColorMode}
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        color="inherit"
      >
        {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>

      {/* Progress Bar */}
      {isRunning && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }} color="secondary" />
      )}

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Gamified Algorithm Simulator
        </Typography>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Tabs Navigation */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="Algorithm Simulator" />
          <Tab label="Assignments" />
        </Tabs>

        {/* ALGORITHM SIMULATOR TAB */}
        {tabValue === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} lg={9}>
              {/* Algorithm Selector */}
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <AlgorithmSelector
                  selectedAlgorithm={selectedAlgorithm}
                  handleAlgorithmSelect={handleAlgorithmSelect}
                />
              </Paper>

              {/* Code Editor & Inputs */}
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <CustomAlgorithmEditor
                  userCustomCode={userCustomCode}
                  setUserCustomCode={setUserCustomCode}
                  inputArray={inputArray}
                  setInputArray={setInputArray}
                  graphInput={graphInput}
                  setGraphInput={setGraphInput}
                  startNode={startNode}
                  setStartNode={setStartNode}
                  selectedAlgorithm={selectedAlgorithm}
                />

                <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleRunAlgorithm}
                    disabled={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Run Algorithm'}
                  </Button>
                </Box>
              </Paper>

              {/* Results Display */}
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <ResultsDisplay selectedAlgorithm={selectedAlgorithm} results={results} />
              </Paper>

              {/* DP Result Display */}
              {results?.dpResult && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    DP Result
                  </Typography>
                  <pre style={{ fontFamily: 'monospace' }}>{JSON.stringify(results.dpResult, null, 2)}</pre>
                </Paper>
              )}

              {/* Graph Visualizer for BFS */}
              {selectedAlgorithm === 'bfs' && results && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <GraphVisualizer
                    graph={JSON.parse(graphInput)}
                    traversalOrder={results.traversalOrder}
                  />
                </Paper>
              )}
            </Grid>

            {/* Leaderboard */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Leaderboard scores={scores} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ASSIGNMENTS TAB */}
        {tabValue === 1 && (
          <Grid container spacing={4}>
            {/* Left: Assignment List */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <AssignmentList
                  onSelectAssignment={(assignment) => {
                    setSelectedAssignment(assignment);
                    setAssignmentCode(assignment.code || '');
                  }}
                />
              </Paper>
            </Grid>

            {/* Right: Assignment Code Editor + Leaderboard */}
            <Grid item xs={12} md={8} lg={9}>
              {selectedAssignment ? (
                <>
                  <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {selectedAssignment.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedAssignment.description}
                    </Typography>

                    <CustomAlgorithmEditor
                      userCustomCode={assignmentCode}
                      setUserCustomCode={setAssignmentCode}
                      selectedAlgorithm={selectedAssignment.id}
                      inputArray={[]}
                      setInputArray={() => { }}
                      graphInput=""
                      setGraphInput={() => { }}
                      startNode=""
                      setStartNode={() => { }}
                    />

                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleSubmitAssignment}
                        disabled={isRunning}
                      >
                        {isRunning ? 'Submitting...' : 'Submit Assignment'}
                      </Button>
                    </Box>
                  </Paper>

                  {/* Assignment Leaderboard */}
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <AssignmentLeaderboard assignmentId={selectedAssignment.id} reloadTrigger={reloadLeaderboard} />
                  </Paper>
                </>
              ) : (
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" align="center">
                    Select an assignment from the left to get started!
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default App;