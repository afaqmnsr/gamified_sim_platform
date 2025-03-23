import React, { useState } from 'react';
import axios from 'axios';
import { algorithms } from './constants/predefinedAlgorithms';
import AlgorithmSelector from './components/AlgorithmSelector';
import CustomAlgorithmEditor from './components/CustomAlgorithmEditor';
import ResultsDisplay from './components/ResultsDisplay';
import GraphVisualizer from './components/GraphVisualizer';
import Leaderboard from './components/Leaderboard';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [userCustomCode, setUserCustomCode] = useState('');
  const [inputArray, setInputArray] = useState([]);
  const [graphInput, setGraphInput] = useState('');
  const [startNode, setStartNode] = useState('');
  const [results, setResults] = useState(null);
  const [scores, setScores] = useState([]);

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
    try {
      if (!selectedAlgorithm) {
        alert('Please select an algorithm');
        return;
      }

      let payload;

      if (selectedAlgorithm === 'bfs') {
        payload = {
          userCode: userCustomCode,
          graph: JSON.parse(graphInput),
          startNode: startNode
        };
      } else {
        payload = {
          userCode: userCustomCode,
          inputData: inputArray
        };
      }

      const response = await axios.post('http://localhost:5000/run-user-algorithm', payload);

      setResults(response.data);
      setScores((prevScores) => [...prevScores, { name: 'Player', score: response.data.score }]);
    } catch (error) {
      console.error('Error running algorithm:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Gamified Algorithm Simulator
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Left Column */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <AlgorithmSelector
                selectedAlgorithm={selectedAlgorithm}
                handleAlgorithmSelect={handleAlgorithmSelect}
              />
            </Paper>

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
                >
                  Run Algorithm
                </Button>
              </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <ResultsDisplay selectedAlgorithm={selectedAlgorithm} results={results} />
            </Paper>

            {selectedAlgorithm === 'bfs' && results && (
              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <GraphVisualizer
                  graph={JSON.parse(graphInput)}
                  traversalOrder={results.traversalOrder}
                />
              </Paper>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Leaderboard scores={scores} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;