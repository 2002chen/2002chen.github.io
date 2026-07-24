let pyodideReady;

async function getPyodide() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
      return loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });
    })();
  }
  return pyodideReady;
}

self.onmessage = async (event) => {
  const { id, code } = event.data;
  try {
    const pyodide = await getPyodide();
    let output = '';
    pyodide.setStdout({ batched: (text) => { output += text + '\n'; } });
    pyodide.setStderr({ batched: (text) => { output += text + '\n'; } });
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null && !output) output = String(result);
    self.postMessage({ id, ok: true, output: output.trimEnd() });
  } catch (error) {
    self.postMessage({ id, ok: false, output: String(error && error.message ? error.message : error) });
  }
};
