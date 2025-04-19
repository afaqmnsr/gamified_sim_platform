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
import GraphDrawer from './components/GraphDrawer';
import CounterexampleDisplay from './components/CounterexampleDisplay';
import ProofGraphVisualizer from './components/ProofVisualizer';
import PetriNetSimulator from './components/PetriNetSimulator';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
import DPMatrixVisualizer from './components/DPMatrixVisualizer';
import AdminPanel from './components/AdminPanel';
import { ReactFlowProvider } from 'reactflow';

import {
  Box,
  Button,
  Container,
  Typography,
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

  const [tabValue, setTabValue] = useState(0); // 0 = Simulator, 1 = Assignments, 2 = Admin
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'error' | 'success' | 'info'
  const [graphDrawerOpen, setGraphDrawerOpen] = useState(false);
  const [counterexample, setCounterexample] = useState(null);
  const [proofData, setProofData] = useState(null);
  const [language, setLanguage] = useState('js'); // 'js' or 'python'
  const [currentStep, setCurrentStep] = useState(0);

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const handleAlgorithmSelect = (algoId) => {
    const algo = algorithms.find((a) => a.id === algoId);
    if (!algo) return;

    setSelectedAlgorithm(algoId);

    if (algo.type === 'petri') {
      // No code or input needed
      setUserCustomCode('');
      setInputArray([]);
      setGraphInput('');
      setStartNode('');
      return;
    }

    // Show Python template or JS by current mode
    setUserCustomCode(language === 'python' ? algo.pythonCode : algo.code);

    if (algo.defaultInput) setInputArray(algo.defaultInput);
    if (algo.defaultGraph) setGraphInput(JSON.stringify(algo.defaultGraph, null, 2));
    if (algo.defaultStartNode) setStartNode(algo.defaultStartNode);
  };

  const validateJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  const handleRunAlgorithm = async () => {
    if (selectedAlgorithm === 'petriNetSim') {
      showSnackbar('Use the visual interface below to simulate the Petri Net.', 'info');
      return;
    }

    if (!selectedAlgorithm) {
      return showSnackbar('Please select an algorithm', 'warning');
    }
    if (!userCustomCode) {
      return showSnackbar('No algorithm code found!', 'warning');
    }

    const algo = algorithms.find(a => a.id === selectedAlgorithm);

    // ✅ Safely parse graphInput only if it exists and is valid JSON
    let parsedGraph = null;

    if (graphInput && graphInput.trim() !== '') {
      parsedGraph = validateJSON(graphInput);
      if (!parsedGraph) {
        showSnackbar('Invalid graph input JSON!', 'error');
        return;
      }
    }

    if (language === 'python') {
      let finalInput;

      if (selectedAlgorithm === 'bfs') {
        finalInput = {
          graph: parsedGraph,
          startNode
        };
      } else if (selectedAlgorithm === 'lcsDP') {
        finalInput = {
          text1: inputArray[0],
          text2: inputArray[1]
        };
      } else if (['knapsackDP', 'knapsackProblem'].includes(selectedAlgorithm)) {
        finalInput = inputArray; // already structured correctly in defaultInput
      } else if (selectedAlgorithm === 'fibonacciDP') {
        finalInput = { input: inputArray[0] }; // expects a number directly
      } else {
        finalInput = { input: inputArray }; // default case for sorting
      }

      const response = await axios.post('http://localhost:5000/run-python-code', {
        userCode: userCustomCode,
        inputData: finalInput
      });

      setResults(response.data);
      return;
    }

    let payload = {
      userCode: userCustomCode,
      inputData: inputArray || [],
      graph: (selectedAlgorithm === 'bfs' && parsedGraph) ? parsedGraph : null,
      startNode: (selectedAlgorithm === 'bfs' && startNode) ? startNode : null
    };

    try {
      setIsRunning(true);
      setCounterexample(null); // Reset on every run

      // Run user Code
      const response = await axios.post('http://localhost:5000/run-user-algorithm', payload);
      setResults(response.data);
      showSnackbar('Algorithm ran successfully!', 'success');

      let resultData = response.data;

      // 🔧 Flatten result and steps from sortedArray if needed
      if (resultData.sortedArray && typeof resultData.sortedArray === 'object') {
        if (!resultData.result && resultData.sortedArray.result) {
          resultData.result = resultData.sortedArray.result;
        }
        if ((!resultData.steps || resultData.steps.length === 0) && resultData.sortedArray.steps) {
          resultData.steps = resultData.sortedArray.steps;
        }

        if (resultData?.customResult?.dpMatrix) {
          resultData.dpMatrix = resultData.customResult.dpMatrix;
        }
      }
      setResults(resultData);

      // SMT Validation (if algo.smtType defined)
      if (algo?.smtType) {
        await runSMTValidation(algo.smtType, algo.smtConstraints || {}, parsedGraph);
      }

      // Symbolic Execution (if algo.enableSymbolicExecution true)
      if (algo?.enableSymbolicExecution) {
        await runSymbolicExecution(userCustomCode);
      }

      // Update scores after validations
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

  const runSMTValidation = async (smtType, constraints, parsedGraph) => {
    try {
      let finalConstraints = constraints;

      if (smtType === "isGraphBipartite") {
        if (!parsedGraph) {
          showSnackbar('No valid graph provided for bipartiteness check!', 'error');
          return;
        }

        const nodes = Object.keys(parsedGraph);
        const edges = [];

        nodes.forEach(source => {
          parsedGraph[source].forEach(target => {
            edges.push({ source, target });
          });
        });

        finalConstraints = { nodes, edges };
      }

      const smtRes = await axios.post('http://localhost:5000/analyze-smt', {
        algorithmType: smtType,
        params: finalConstraints
      });

      console.log("SMT Validation Response:", smtRes.data);

      const { valid, proof, counterexample, message } = smtRes.data;

      console.log('SMT Validation Result:', valid, proof, counterexample, message);

      setCounterexample(null);
      setProofData(null);

      if (!valid) {
        if (counterexample) {
          setCounterexample(counterexample);
          showSnackbar('SMT Counterexample found!', 'warning');
        } else {
          showSnackbar('SMT Validation failed, no counterexample.', 'error');
        }
      } else {
        if (proof) {
          setProofData(proof);
          showSnackbar(message || 'SMT validation passed with proof!', 'success');
        } else {
          showSnackbar(message || 'SMT validation passed!', 'success');
        }
      }

    } catch (error) {
      console.error('SMT Validation error:', error);
      showSnackbar('SMT validation failed', 'error');
      setProofData(null);
    }
  };

  const runSymbolicExecution = async (code) => {
    try {
      const response = await axios.post('http://localhost:5000/analyze-symbolic-execution', { code });

      if (!response.data.valid) {
        setCounterexample(response.data.counterexample);
        showSnackbar('Symbolic execution counterexample found!', 'warning');
      } else {
        showSnackbar(response.data.message || 'Symbolic execution passed!', 'success');
        setCounterexample(null);
      }
    } catch (error) {
      console.error('Symbolic Execution error:', error);
      showSnackbar('Symbolic execution failed', 'error');
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

  const handleGraphSave = (adjacencyList) => {
    setGraphInput(JSON.stringify(adjacencyList, null, 2));
    showSnackbar('Graph saved successfully!', 'success');
  };

  const getCurrentHighlightedCell = (steps, stepIndex) => {
    if (!steps || stepIndex < 0 || stepIndex >= steps.length) return null;
    const step = steps[stepIndex];
    if (step?.type === 'match' || step?.type === 'mismatch' || step?.type === 'choice' || step?.type === 'skip') {
      return { i: step.i, j: step.j ?? step.w };
    }
    return null;
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

      {/* GraphDrawer */}
      <GraphDrawer
        open={graphDrawerOpen}
        handleClose={() => setGraphDrawerOpen(false)}
        onGraphSave={handleGraphSave}
      />

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
          <Tab label={selectedAlgorithm === 'petriNetSim' ? "Petri Net Simulator" : "Algorithm Simulator"} />
          <Tab label="Assignments" />
          <Tab label="Admin" />
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
              {selectedAlgorithm !== 'petriNetSim' && (
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
                    setGraphDrawerOpen={setGraphDrawerOpen}
                    isRunning={isRunning}
                    handleRunAlgorithm={handleRunAlgorithm}
                    language={language}
                    setLanguage={setLanguage}
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
              )}

              {/* Results Display */}
              {selectedAlgorithm !== 'petriNetSim' && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <ResultsDisplay selectedAlgorithm={selectedAlgorithm} results={results} />
                </Paper>
              )}

              {(results?.steps?.length > 0 || results?.sortedArray?.steps?.length > 0) && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Visualization
                  </Typography>
                  <AlgorithmVisualizer
                    steps={results?.steps?.length > 0 ? results.steps : results.sortedArray?.steps}
                    initialArray={inputArray}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    dpMatrix={results.dpMatrix}
                  />
                </Paper>
              )}

              {Array.isArray(results?.dpMatrix) && results.dpMatrix.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    DP Matrix
                  </Typography>
                  <DPMatrixVisualizer
                    dpMatrix={results.dpMatrix}
                    currentStep={currentStep}
                    highlightedCell={getCurrentHighlightedCell(results?.steps, currentStep)}
                  />
                </Paper>
              )}

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
              {selectedAlgorithm === 'bfs' && results?.traversalOrder && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <GraphVisualizer
                    graph={validateJSON(graphInput)}
                    traversalOrder={results.traversalOrder}
                  />
                </Paper>
              )}

              {/* Petrinet */}
              {selectedAlgorithm === 'petriNetSim' && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <ReactFlowProvider>
                    <PetriNetSimulator setSnackbar={showSnackbar} />
                  </ReactFlowProvider>
                </Paper>
              )}

            </Grid>

            {/* Leaderboard */}
            <Grid item xs={12} md={4} lg={3}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Leaderboard scores={scores} />
              </Paper>

              {/* Counterexample + Proof visualization */}
              {counterexample && (
                <CounterexampleDisplay counterexample={counterexample} />
              )}

              {(proofData || counterexample) && (
                <ProofGraphVisualizer proof={proofData || { explanation: "Counterexample found", ...counterexample }} />
              )}

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
                    <Typography variant="caption" color="secondary">
                      Difficulty: {selectedAssignment.difficulty}
                    </Typography>

                    <CustomAlgorithmEditor
                      userCustomCode={assignmentCode}
                      setUserCustomCode={setAssignmentCode}
                      selectedAlgorithm={selectedAssignment ? selectedAssignment.id : ''}
                      inputArray={[]} // Optional input editing, depending on assignment policy
                      setInputArray={() => { }}
                      graphInput=""
                      setGraphInput={() => { }}
                      startNode=""
                      setStartNode={() => { }}
                    />

                    {/* Assignment Input Preview */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Input Configuration
                      </Typography>

                      <Paper elevation={2} sx={{ p: 2 }}>
                        {selectedAssignment?.type === 'graph' && (
                          <>
                            <Typography variant="body2" gutterBottom>
                              <strong>Graph:</strong>
                            </Typography>
                            <pre style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                              {JSON.stringify(selectedAssignment.input.graph, null, 2)}
                            </pre>

                            <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                              <strong>Start Node:</strong> {selectedAssignment.input.startNode}
                            </Typography>

                            {selectedAssignment.input.targetNode && (
                              <Typography variant="body2">
                                <strong>Target Node:</strong> {selectedAssignment.input.targetNode}
                              </Typography>
                            )}
                          </>
                        )}

                        {selectedAssignment?.type === 'dp' && (
                          <>
                            <Typography variant="body2" gutterBottom>
                              <strong>Input:</strong>
                            </Typography>
                            <pre style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                              {JSON.stringify(selectedAssignment.input, null, 2)}
                            </pre>
                          </>
                        )}

                        {selectedAssignment?.type === 'custom' && (
                          <>
                            <Typography variant="body2" gutterBottom>
                              <strong>Input:</strong>
                            </Typography>
                            <pre style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                              {JSON.stringify(selectedAssignment.input, null, 2)}
                            </pre>
                          </>
                        )}
                      </Paper>
                    </Box>
                  

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
                    <AssignmentLeaderboard
                      assignmentId={selectedAssignment.id}
                      reloadTrigger={reloadLeaderboard}
                    />
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

        {tabValue === 2 && (
          <AdminPanel />
        )}
      </Container>
    </Box>
  );
}

export default App;