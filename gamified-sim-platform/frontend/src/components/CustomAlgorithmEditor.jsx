import { algorithms } from '../constants/predefinedAlgorithms'
import {
    Box,
    Button,
    Typography,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

import AceEditor from 'react-ace';
import ace from 'ace-builds';
ace.config.set("basePath", "/ace");

// Modes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';

// Themes
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';

// Extensions
import 'ace-builds/src-noconflict/ext-language_tools';

ace.require('ace/ext/language_tools').addCompleter({
    getCompletions: (editor, session, pos, prefix, callback) => {
        callback(null, [
            { caption: 'customFunction', value: 'customFunction()', meta: 'custom' }
        ]);
    }
});

// Utility function to check if algorithm expects complex structured input
const isComplexInputAlgorithm = (algoId) =>
    ['knapsackDP', 'lcsDP'].includes(algoId);

const CustomAlgorithmEditor = ({
    userCustomCode,
    setUserCustomCode,
    inputArray,
    setInputArray,
    graphInput,
    setGraphInput,
    startNode,
    setStartNode,
    selectedAlgorithm,
    setGraphDrawerOpen,
    isRunning,
    handleRunAlgorithm,
    language,
    setLanguage
}) => {

    const handleJsonInputChange = (e) => {
        try {
            const parsed = JSON.parse(e.target.value);
            setInputArray(parsed);
        } catch (err) {
            console.warn('Invalid JSON input');
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        const algo = algorithms.find((a) => a.id === selectedAlgorithm);
        if (algo) {
            setUserCustomCode(newLang === 'python' ? algo.pythonCode : algo.code);
        }
    };

    return (
        <Box>

            {/* 🧠 Language Selector */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="lang-label">Language</InputLabel>
                <Select
                    labelId="lang-label"
                    value={language}
                    label="Language"
                    onChange={(e) => handleLanguageChange(e.target.value)}
                >
                    <MenuItem value="js">JavaScript</MenuItem>
                    <MenuItem value="python">Python</MenuItem>
                </Select>
            </FormControl>

            {/* Code Editor Title */}
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Algorithm Code Editor
            </Typography>

            {/* Code Editor */}
            <AceEditor
                mode={language === 'python' ? 'python' : 'javascript'}
                // theme={theme.palette?.mode === 'dark' ? 'monokai' : 'github'}
                theme="monokai"
                name="algorithmEditor"
                value={userCustomCode}
                onChange={setUserCustomCode}
                fontSize={14}
                width="100%"
                height="400px"
                showPrintMargin
                showGutter
                highlightActiveLine
                placeholder={
                    language === 'python'
                        ? '# 🧠 def run(input_data):\n#     arr = input_data["input"]\n#     return sorted(arr)'
                        : '// 🧠 function run(input) {\n//     return input.sort();\n// }'
                }
                setOptions={{
                    useWorker: true,
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                    wrap: true,
                    foldStyle: 'markbeginend',
                    showFoldWidgets: true,
                    highlightSelectedWord: true,
                    highlightActiveLine: true,
                    displayIndentGuides: true,
                    cursorStyle: 'smooth',
                    behavioursEnabled: true,
                    copyWithEmptySelection: true,
                }}
                editorProps={{ $blockScrolling: true }}
            />

            {/* Inputs Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Input Configuration
                </Typography>

                <Grid container spacing={2}>

                    {/* Simple Array Input (Sorting Algorithms) */}
                    {['bubbleSort', 'quickSort', 'mergeSort', 'fibonacciDP'].includes(selectedAlgorithm) && (
                        <Grid item xs={12}>
                            <TextField
                                label={
                                    selectedAlgorithm === 'fibonacciDP'
                                        ? 'N Value (Single Number)'
                                        : 'Input Array (comma-separated)'
                                }
                                fullWidth
                                value={
                                    selectedAlgorithm === 'fibonacciDP'
                                        ? inputArray[0] ?? ''
                                        : inputArray.join(',')
                                }
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (selectedAlgorithm === 'fibonacciDP') {
                                        const num = Number(value.trim());
                                        if (!isNaN(num)) setInputArray([num]);
                                    } else {
                                        setInputArray(
                                            value
                                                .split(',')
                                                .map((val) => Number(val.trim()))
                                                .filter((val) => !isNaN(val))
                                        );
                                    }
                                }}
                            />
                        </Grid>
                    )}

                    {/* JSON Input (Structured Data Algorithms) */}
                    {isComplexInputAlgorithm(selectedAlgorithm) && (
                        <Grid item xs={12}>
                            <TextField
                                label="Structured Input (JSON format)"
                                multiline
                                minRows={6}
                                fullWidth
                                value={JSON.stringify(inputArray, null, 2)}
                                onChange={(e) => {
                                    try {
                                        setInputArray(JSON.parse(e.target.value));
                                    } catch {
                                        console.warn('Invalid JSON');
                                    }
                                }}
                                helperText="Edit the JSON object for input data."
                            />
                        </Grid>
                    )}

                    {/* Graph Input for BFS */}
                    {selectedAlgorithm === 'bfs' && (
                        <>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    label="Graph (Adjacency List JSON)"
                                    multiline
                                    rows={5}
                                    fullWidth
                                    value={graphInput}
                                    onChange={(e) => setGraphInput(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Start Node"
                                    fullWidth
                                    value={startNode}
                                    onChange={(e) => setStartNode(e.target.value)}
                                />
                            </Grid>

                            {/* Add Draw Graph button */}
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setGraphDrawerOpen(true)}
                                >
                                    Draw Custom Graph
                                </Button>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default CustomAlgorithmEditor;