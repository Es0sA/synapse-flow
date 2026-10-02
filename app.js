// Synapse Flow Interactive Workflow Engine & Page Dynamics

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('interactive-canvas');
  const svg = document.getElementById('cable-svg');
  const runBtn = document.getElementById('run-simulation-btn');
  const resetBtn = document.getElementById('reset-canvas-btn');
  const execStatus = document.getElementById('exec-status');
  const execTime = document.getElementById('exec-time');
  const runText = document.getElementById('run-text');

  // Default node positions
  const defaultPositions = {
    'node-1': { top: 120, left: 40 },
    'node-2': { top: 80, left: 340 },
    'node-3': { top: 30, left: 660 },
    'node-4': { top: 260, left: 420 },
    'node-5': { top: 160, left: 780 }
  };

  // Node Connections definition
  const connections = [
    { from: 'node-1', fromPort: '.output-port', to: 'node-2', toPort: '.input-port', id: 'cable-1-2' },
    { from: 'node-2', fromPort: '.output-port-top', to: 'node-3', toPort: '.input-port', id: 'cable-2-3' },
    { from: 'node-2', fromPort: '.output-port-bottom', to: 'node-4', toPort: '.input-port', id: 'cable-2-4' },
    { from: 'node-3', fromPort: '.output-port', to: 'node-5', toPort: '.input-port-top', id: 'cable-3-5' },
    { from: 'node-4', fromPort: '.output-port', to: 'node-5', toPort: '.input-port-bottom', id: 'cable-4-5' }
  ];

  // Draw Bezier curves
  function drawCables(activeCables = []) {
    // Keep defs in SVG
    const defs = svg.querySelector('defs').outerHTML;
    let pathsHtml = defs;

    const canvasRect = canvas.getBoundingClientRect();

    connections.forEach((conn) => {
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;

      const fromPortEl = fromEl.querySelector(conn.fromPort) || fromEl;
      const toPortEl = toEl.querySelector(conn.toPort) || toEl;

      const fromRect = fromPortEl.getBoundingClientRect();
      const toRect = toPortEl.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
      const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

      const dx = Math.max(Math.abs(x2 - x1) * 0.55, 40);
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

      const isActive = activeCables.includes(conn.id);
      const strokeColor = isActive ? 'url(#cableGradientActive)' : 'url(#cableGradient1)';
      const strokeWidth = isActive ? 3 : 2;
      const flowClass = isActive ? 'cable-flow-active' : 'cable-flow';
      const filterAttr = isActive ? 'filter="url(#glow)"' : '';

      // Base cable glow background
      pathsHtml += `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${isActive ? '1' : '0.65'}" ${filterAttr} />`;
      // Animated pulse cable
      pathsHtml += `<path d="${d}" fill="none" stroke="${isActive ? '#38bdf8' : '#ffa200'}" stroke-width="${strokeWidth + 1}" class="${flowClass}" opacity="0.9" />`;
    });

    svg.innerHTML = pathsHtml;
  }

  // Drag and drop mechanism
  let activeDragNode = null;
  let dragOffset = { x: 0, y: 0 };

  const nodes = document.querySelectorAll('.workflow-node');
  nodes.forEach(node => {
    node.addEventListener('mousedown', (e) => {
      activeDragNode = node;
      const rect = node.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      node.style.zIndex = '30';
      e.stopPropagation();
    });
  });

  window.addEventListener('mousemove', (e) => {
    if (!activeDragNode) return;
    const canvasRect = canvas.getBoundingClientRect();
    let newX = e.clientX - canvasRect.left - dragOffset.x;
    let newY = e.clientY - canvasRect.top - dragOffset.y;

    // Constrain inside canvas
    newX = Math.max(10, Math.min(canvasRect.width - activeDragNode.offsetWidth - 10, newX));
    newY = Math.max(10, Math.min(canvasRect.height - activeDragNode.offsetHeight - 10, newY));

    activeDragNode.style.left = `${newX}px`;
    activeDragNode.style.top = `${newY}px`;

    requestAnimationFrame(() => drawCables(currentActiveCables));
  });

  window.addEventListener('mouseup', () => {
    if (activeDragNode) {
      activeDragNode.style.zIndex = '20';
      activeDragNode = null;
    }
  });

  // Reset node positions
  resetBtn.addEventListener('click', () => {
    Object.keys(defaultPositions).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.left = `${defaultPositions[id].left}px`;
        el.style.top = `${defaultPositions[id].top}px`;
      }
    });
    setTimeout(() => drawCables(currentActiveCables), 50);
  });

  // 3D perspective mouse tracking tilt on canvas
  const stage = document.querySelector('.perspective-stage');
  const canvasWindow = document.querySelector('.canvas-window');
  if (stage && canvasWindow) {
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      canvasWindow.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
    });
    stage.addEventListener('mouseleave', () => {
      canvasWindow.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0px)';
    });
  }

  // Interactive Execution Simulation
  let isExecuting = false;
  let currentActiveCables = [];

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function runSimulation() {
    if (isExecuting) return;
    isExecuting = true;
    runBtn.classList.add('opacity-75', 'cursor-not-allowed');
    runText.textContent = 'Simulating...';

    // Reset status indicators
    nodes.forEach(n => {
      n.classList.remove('active-executing');
      const ind = n.querySelector('.status-indicator');
      if (ind) ind.style.backgroundColor = '#64748b';
    });

    currentActiveCables = [];
    drawCables();

    execStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Executing pipeline...';
    execStatus.className = 'text-amber-400 font-bold flex items-center gap-1.5';
    const startTime = performance.now();

    // Step 1: Node 1 Trigger
    const n1 = document.getElementById('node-1');
    n1.classList.add('active-executing');
    currentActiveCables = ['cable-1-2'];
    drawCables(currentActiveCables);
    await sleep(400);

    // Step 2: Node 2 Classifier
    n1.classList.remove('active-executing');
    const n2 = document.getElementById('node-2');
    n2.classList.add('active-executing');
    currentActiveCables = ['cable-2-3', 'cable-2-4'];
    drawCables(currentActiveCables);
    await sleep(450);

    // Step 3: Node 3 (Vector DB) & Node 4 (Python) concurrently
    n2.classList.remove('active-executing');
    const n3 = document.getElementById('node-3');
    const n4 = document.getElementById('node-4');
    n3.classList.add('active-executing');
    n4.classList.add('active-executing');
    currentActiveCables = ['cable-3-5', 'cable-4-5'];
    drawCables(currentActiveCables);
    await sleep(550);

    // Step 4: Node 5 Dispatcher
    n3.classList.remove('active-executing');
    n4.classList.remove('active-executing');
    const n5 = document.getElementById('node-5');
    n5.classList.add('active-executing');
    await sleep(400);

    // Done
    n5.classList.remove('active-executing');
    nodes.forEach(n => {
      const ind = n.querySelector('.status-indicator');
      if (ind) ind.style.backgroundColor = '#10b981';
    });

    const elapsed = Math.round(performance.now() - startTime);
    execStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span> 5/5 Nodes Succeeded';
    execStatus.className = 'text-emerald-400 font-bold flex items-center gap-1.5';
    execTime.textContent = `Execution time: ${elapsed}ms`;

    runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    runText.textContent = 'Re-Run Simulation';
    isExecuting = false;
  }

  runBtn.addEventListener('click', runSimulation);

  // Tab button switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active', 'text-white'));
      tabs.forEach(t => t.classList.add('text-slate-400'));
      tab.classList.add('active', 'text-white');
      tab.classList.remove('text-slate-400');

      if (idx === 0) {
        document.getElementById('workflow-engine').scrollIntoView({ behavior: 'smooth' });
      } else if (idx === 1) {
        document.getElementById('stacked-debug').scrollIntoView({ behavior: 'smooth' });
      } else if (idx === 2) {
        document.getElementById('deploy-section').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Language switcher for Bento Code snippet
  const btnPy = document.getElementById('lang-py');
  const btnJs = document.getElementById('lang-js');
  const codeBody = document.getElementById('code-snippet-body');

  const pyCode = `<span class="text-cyan-400">def</span> <span class="text-yellow-300">process</span>(items):<br>
  &nbsp;&nbsp;cleaned = [x.strip() <span class="text-cyan-400">for</span> x <span class="text-cyan-400">in</span> items]<br>
  &nbsp;&nbsp;<span class="text-cyan-400">return</span> {<span class="text-emerald-300">"status"</span>: <span class="text-emerald-300">"ready"</span>, <span class="text-emerald-300">"count"</span>: len(cleaned)}`;

  const jsCode = `<span class="text-cyan-400">export default async function</span>(<span class="text-yellow-300">{ $items }</span>) {<br>
  &nbsp;&nbsp;<span class="text-cyan-400">const</span> cleaned = $items.map(x => x.json.text.trim());<br>
  &nbsp;&nbsp;<span class="text-cyan-400">return</span> [{ json: { status: <span class="text-emerald-300">"ready"</span>, count: cleaned.length } }];<br>
}`;

  btnPy.addEventListener('click', () => {
    btnPy.className = 'px-2 py-0.5 rounded bg-white/10 text-white font-bold';
    btnJs.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-white';
    codeBody.innerHTML = pyCode;
  });

  btnJs.addEventListener('click', () => {
    btnJs.className = 'px-2 py-0.5 rounded bg-white/10 text-white font-bold';
    btnPy.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-white';
    codeBody.innerHTML = jsCode;
  });

  // Run code button interaction
  const testCodeBtn = document.getElementById('test-code-btn');
  testCodeBtn.addEventListener('click', () => {
    testCodeBtn.textContent = 'Executing...';
    setTimeout(() => {
      testCodeBtn.textContent = 'Success (0.3ms)';
      setTimeout(() => {
        testCodeBtn.textContent = 'Run Code';
      }, 1500);
    }, 350);
  });

  // Copy docker command
  const copyDockerBtn = document.getElementById('copy-docker-btn');
  copyDockerBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(`docker run -d --name synapse-flow -p 5678:5678 -v ~/.synapse:/home/node/.synapse synapseflow/synapse-core:latest`);
    copyDockerBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyDockerBtn.textContent = 'Copy';
    }, 2000);
  });

  // Stacked cards scroll progression
  const stackedCards = document.querySelectorAll('.stacked-card');
  window.addEventListener('scroll', () => {
    stackedCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      // If card has stuck to its top position and subsequent cards are scrolling over it
      if (rect.top <= 220) {
        const offset = Math.max(0, 220 - rect.top);
        const scale = Math.max(0.92, 1 - (offset * 0.0004));
        const opacity = Math.max(0.6, 1 - (offset * 0.0015));
        card.style.transform = `scale(${scale})`;
      } else {
        card.style.transform = 'scale(1)';
      }
    });
  });

  // Initialize cables
  window.addEventListener('resize', () => drawCables(currentActiveCables));
  setTimeout(() => drawCables(), 100);
});
