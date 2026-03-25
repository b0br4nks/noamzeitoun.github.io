(function () {
  const FULL_NAME = "Noam Zeitoun";
  const TYPE_MS = 78;
  /** One blink cycle at 1s step-end ≈ 1s; then cursor stays solid */
  const CURSOR_STOP_MS = 1050;

  const typedEl = document.getElementById("typed-name");
  const cursorEl = document.getElementById("name-cursor");
  const scrollRoot = document.getElementById("main-scroll");
  const navLinks = document.querySelectorAll(".nav__link[data-section]");
  const snapDots = document.querySelectorAll(".snap-dot[data-index]");
  const snapDotsContainer = document.getElementById("snap-dots");

  function typeNameOnce() {
    if (!typedEl || !cursorEl) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      typedEl.textContent = FULL_NAME;
      cursorEl.classList.add("cursor--done");
      return;
    }
    let i = 0;
    function step() {
      if (i < FULL_NAME.length) {
        typedEl.textContent += FULL_NAME[i];
        i += 1;
        window.setTimeout(step, TYPE_MS);
        return;
      }
      window.setTimeout(function () {
        cursorEl.classList.add("cursor--done");
      }, CURSOR_STOP_MS);
    }
    window.requestAnimationFrame(function () {
      window.setTimeout(step, 400);
    });
  }

  function setActiveSection(id, index) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.section === id);
    });
    snapDots.forEach(function (dot) {
      dot.classList.toggle("is-active", Number(dot.dataset.index) === index);
    });
    if (snapDotsContainer) {
      snapDotsContainer.classList.toggle("dots-hidden", index === 0);
    }
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll(".section[data-section]");
    if (!sections.length || !scrollRoot) return;

    let activeId = sections[0].dataset.section || "";
    let activeIndex = 0;
    setActiveSection(activeId, activeIndex);
    sections.forEach(function (sec) {
      const isActive = sec.dataset.section === activeId;
      sec.classList.toggle("active", isActive);
      sec.classList.toggle("is-inactive", !isActive);
    });

    const io = new IntersectionObserver(
      function (entries) {
        let best = null;
        for (let i = 0; i < entries.length; i += 1) {
          const e = entries[i];
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best || !best.isIntersecting) return;
        const id = best.target.getAttribute("data-section") || "";
        if (!id) return;
        const idx = Array.prototype.indexOf.call(sections, best.target);
        activeIndex = idx >= 0 ? idx : 0;
        activeId = id;
        setActiveSection(id, activeIndex);
        sections.forEach(function (sec) {
          const isActive = sec.dataset.section === id;
          sec.classList.toggle("active", isActive);
          sec.classList.toggle("is-inactive", !isActive);
        });
      },
      { root: scrollRoot, threshold: [0.35, 0.6, 0.85] }
    );

    sections.forEach(function (sec) { io.observe(sec); });
  }

  function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function applyLabel() {
      const light = document.documentElement.getAttribute("data-theme") === "light";
      btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    }

    applyLabel();

    btn.addEventListener("click", function () {
      const root = document.documentElement;
      const isLight = root.getAttribute("data-theme") === "light";
      try {
        if (isLight) {
          root.removeAttribute("data-theme");
          localStorage.setItem("theme", "dark");
        } else {
          root.setAttribute("data-theme", "light");
          localStorage.setItem("theme", "light");
        }
      } catch (e) {
        if (isLight) {
          root.removeAttribute("data-theme");
        } else {
          root.setAttribute("data-theme", "light");
        }
      }
      applyLabel();
    });
  }

  function initNavClick() {
    navLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const desktop = window.matchMedia("(min-width: 769px)").matches;
        if (desktop && scrollRoot) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        history.replaceState(null, "", href);
      });
    });
  }

  function initGraphColumnToggle() {
    const toggle = document.getElementById("emb-toggle");
    const mobileToggle = document.getElementById("graph-toggle-mobile");
    const backdrop = document.getElementById("graph-backdrop");
    const mobileMq = window.matchMedia("(max-width: 1199px)");
    if (!toggle && !mobileToggle) return;

    function syncLabel() {
      const open = document.body.classList.contains("graph-open");
      if (toggle) {
        toggle.textContent = "";
        toggle.setAttribute("aria-label", open ? "Hide graph explorer" : "Show graph explorer");
      }
      if (mobileToggle) {
        mobileToggle.textContent = open ? "hide" : "try me";
        mobileToggle.setAttribute("aria-label", open ? "Hide graph explorer" : "Show graph explorer");
      }
      if (backdrop) {
        backdrop.setAttribute("aria-hidden", open ? "false" : "true");
      }
    }

    syncLabel();

    function toggleOpen() {
      document.body.classList.toggle("graph-open");
      syncLabel();
    }

    function onViewportChange() {
      // On mobile, default to the content page and let "try me" open the graph page.
      if (mobileMq.matches) {
        document.body.classList.remove("graph-open");
      }
      syncLabel();
    }

    if (toggle) toggle.addEventListener("click", toggleOpen);
    if (mobileToggle) mobileToggle.addEventListener("click", toggleOpen);
    if (mobileMq && mobileMq.addEventListener) {
      mobileMq.addEventListener("change", onViewportChange);
    }
    onViewportChange();
  }

  function initEmbeddingSpace() {
    const canvas = document.getElementById("emb-canvas");
    const infoEl = document.getElementById("emb-info");
    const metricsEl = document.getElementById("emb-metrics");
    const tempInput = document.getElementById("emb-temp");
    const tempVal = document.getElementById("emb-temp-val");
    const kInput = document.getElementById("emb-k");
    const kVal = document.getElementById("emb-k-val");
    const aiBudgetInput = document.getElementById("emb-ai-budget");
    const aiBudgetVal = document.getElementById("emb-ai-budget-val");
    const aiBatchInput = document.getElementById("emb-ai-batch");
    const aiBatchVal = document.getElementById("emb-ai-batch-val");
    const algoBtns = document.querySelectorAll(".emb-algo[data-algo]");
    const clearBtn = document.getElementById("emb-clear");
    const randomBtn = document.getElementById("emb-random");
    if (
      !canvas ||
      !infoEl ||
      !metricsEl ||
      !tempInput ||
      !tempVal ||
      !kInput ||
      !kVal ||
      !clearBtn ||
      !randomBtn
    ) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const concepts = [
      "transformer", "attention", "encoder", "decoder", "embedding", "layer norm", "residual", "positional",
      "gradient", "backprop", "loss", "optimizer", "dropout", "learning rate", "batch norm", "regularization",
      "prompt", "token", "context", "temperature", "KV cache", "sampling", "logits", "generation",
      "latency", "throughput", "RAG", "retrieval", "vector store", "quantization", "pipeline", "reranking",
    ];

    const state = {
      w: 0,
      h: 0,
      dpr: 1,
      hoverNode: -1,
      sourceNode: 0,
      latestNode: -1,
      algorithm: "dijkstra",
      temperature: 0.4,
      k: 2,
      infoOverride: "",
      aiToken: 0,
      aiStats: null,
      aiBudget: aiBudgetInput ? Number(aiBudgetInput.value) : 6,
      aiBatchSize: aiBatchInput ? Number(aiBatchInput.value) : 3,
      dashOffset: 0,
      animStart: 0,
      animEdgeCount: 0,
      theme: "dark",
      lastFrame: 0,
    };

    const graph = {
      nodes: [],
      edges: [],
      pathNodes: new Set(),
      pathEdgeSet: new Set(),
      pathEdgeOrder: [],
      exploreEvents: [],
      finalNodeOrder: [],
      pathCost: 0,
      pathLength: 0,
    };

    function MinHeap() {
      this.a = [];
    }
    MinHeap.prototype.push = function (item) {
      const a = this.a;
      a.push(item);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p].k <= a[i].k) break;
        const t = a[p];
        a[p] = a[i];
        a[i] = t;
        i = p;
      }
    };
    MinHeap.prototype.pop = function () {
      const a = this.a;
      if (!a.length) return null;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;
          if (l < a.length && a[l].k < a[m].k) m = l;
          if (r < a.length && a[r].k < a[m].k) m = r;
          if (m === i) break;
          const t = a[m];
          a[m] = a[i];
          a[i] = t;
          i = m;
        }
      }
      return top;
    };
    MinHeap.prototype.size = function () {
      return this.a.length;
    };

    function rgbaFromCss(color, alpha) {
      const c = color.trim();
      if (c[0] === "#") {
        const h = c.slice(1);
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return "rgba(" + r + "," + g + "," + b + "," + alpha.toFixed(3) + ")";
      }
      const m = c.match(/\d+(\.\d+)?/g);
      if (!m || m.length < 3) return "rgba(59,130,246," + alpha.toFixed(3) + ")";
      return "rgba(" + Number(m[0]) + "," + Number(m[1]) + "," + Number(m[2]) + "," + alpha.toFixed(3) + ")";
    }

    function dist(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      state.w = Math.max(1, Math.floor(rect.width));
      state.h = Math.max(1, Math.floor(rect.height));
      state.dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(state.w * state.dpr);
      canvas.height = Math.floor(state.h * state.dpr);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    }

    function nodeAt(mx, my) {
      for (let i = graph.nodes.length - 1; i >= 0; i -= 1) {
        const n = graph.nodes[i];
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy <= 10 * 10) return i;
      }
      return -1;
    }

    function addNode(x, y) {
      if (graph.nodes.length >= 30) {
        graph.nodes.shift();
        state.sourceNode = Math.max(0, state.sourceNode - 1);
      }
      graph.nodes.push({
        id: graph.nodes.length ? graph.nodes[graph.nodes.length - 1].id + 1 : 0,
        label: concepts[Math.floor(Math.random() * concepts.length)],
        x: x,
        y: y,
      });
      state.latestNode = graph.nodes.length - 1;
      if (state.sourceNode >= graph.nodes.length) state.sourceNode = 0;
      rebuildEdges();
      runAlgorithm();
    }

    function edgeKey(a, b) {
      return a < b ? a + "|" + b : b + "|" + a;
    }

    function rebuildEdges() {
      const edgesMap = new Map();
      const k = state.k;
      for (let i = 0; i < graph.nodes.length; i += 1) {
        const n = graph.nodes[i];
        const nearest = [];
        for (let j = 0; j < graph.nodes.length; j += 1) {
          if (i === j) continue;
          const d = dist(n, graph.nodes[j]);
          nearest.push({ j: j, d: d });
        }
        nearest.sort(function (a, b) { return a.d - b.d; });
        nearest.slice(0, k).forEach(function (it) {
          const key = edgeKey(i, it.j);
          if (edgesMap.has(key)) return;
          // Ensure weights are always >= euclidean distance (keeps A* heuristic admissible).
          const noise = 1 + state.temperature * Math.random();
          edgesMap.set(key, {
            a: i,
            b: it.j,
            d: it.d,
            w: Math.max(0.001, it.d * noise),
          });
        });
      }
      graph.edges = Array.from(edgesMap.values());
    }

    function neighborsOf(i) {
      const out = [];
      graph.edges.forEach(function (e) {
        if (e.a === i) out.push({ to: e.b, w: e.w, k: edgeKey(e.a, e.b) });
        else if (e.b === i) out.push({ to: e.a, w: e.w, k: edgeKey(e.a, e.b) });
      });
      return out;
    }

    function dijkstra(src, dst) {
      const n = graph.nodes.length;
      const distArr = new Array(n).fill(Infinity);
      const prev = new Array(n).fill(-1);
      const settled = new Array(n).fill(false);
      const events = [];
      const heap = new MinHeap();
      distArr[src] = 0;
      heap.push({ k: 0, n: src });
      while (heap.size()) {
        const item = heap.pop();
        const u = item.n;
        if (settled[u]) continue;
        if (item.k !== distArr[u]) continue;
        settled[u] = true;
        events.push({ t: "node", i: u });
        if (u === dst) break;
        const nbs = neighborsOf(u);
        for (let i = 0; i < nbs.length; i += 1) {
          const nb = nbs[i];
          events.push({ t: "edge", k: nb.k });
          if (settled[nb.to]) continue;
          const alt = distArr[u] + nb.w;
          if (alt < distArr[nb.to]) {
            distArr[nb.to] = alt;
            prev[nb.to] = u;
            heap.push({ k: alt, n: nb.to });
          }
        }
      }
      return { prev: prev, dist: distArr[dst], events: events };
    }

    function bfs(src, dst) {
      const n = graph.nodes.length;
      const prev = new Array(n).fill(-1);
      const seen = new Array(n).fill(false);
      const events = [];
      const q = [src];
      let qi = 0;
      seen[src] = true;
      while (qi < q.length) {
        const u = q[qi++];
        events.push({ t: "node", i: u });
        if (u === dst) break;
        const nbs = neighborsOf(u);
        for (let i = 0; i < nbs.length; i += 1) {
          const nb = nbs[i];
          events.push({ t: "edge", k: nb.k });
          if (!seen[nb.to]) {
            seen[nb.to] = true;
            prev[nb.to] = u;
            q.push(nb.to);
          }
        }
      }
      let cost = 0;
      let cur = dst;
      while (prev[cur] !== -1) {
        const p = prev[cur];
        const e = graph.edges.find(function (x) {
          return (x.a === p && x.b === cur) || (x.a === cur && x.b === p);
        });
        cost += e ? e.w : 0;
        cur = p;
      }
      return { prev: prev, dist: cost, events: events };
    }

    function astar(src, dst) {
      const n = graph.nodes.length;
      const g = new Array(n).fill(Infinity);
      const prev = new Array(n).fill(-1);
      const closed = new Array(n).fill(false);
      const events = [];
      const heap = new MinHeap();
      g[src] = 0;
      heap.push({ k: dist(graph.nodes[src], graph.nodes[dst]), n: src });
      while (heap.size()) {
        const item = heap.pop();
        const u = item.n;
        if (closed[u]) continue;
        // Skip stale entries
        const hU = dist(graph.nodes[u], graph.nodes[dst]);
        if (item.k !== g[u] + hU) continue;
        closed[u] = true;
        events.push({ t: "node", i: u });
        if (u === dst) break;
        const nbs = neighborsOf(u);
        for (let i = 0; i < nbs.length; i += 1) {
          const nb = nbs[i];
          events.push({ t: "edge", k: nb.k });
          if (closed[nb.to]) continue;
          const tentative = g[u] + nb.w;
          if (tentative < g[nb.to]) {
            prev[nb.to] = u;
            g[nb.to] = tentative;
            const h = dist(graph.nodes[nb.to], graph.nodes[dst]);
            heap.push({ k: tentative + h, n: nb.to });
          }
        }
      }
      return { prev: prev, dist: g[dst], events: events };
    }

    function buildPath(prev, src, dst) {
      const out = [];
      let cur = dst;
      while (cur !== -1) {
        out.push(cur);
        if (cur === src) break;
        cur = prev[cur];
      }
      out.reverse();
      if (!out.length || out[0] !== src) return [];
      return out;
    }

    function pathCost(path) {
      if (!path || path.length < 2) return Infinity;
      let cost = 0;
      for (let i = 0; i < path.length - 1; i += 1) {
        const a = path[i];
        const b = path[i + 1];
        const e = graph.edges.find(function (x) {
          return (x.a === a && x.b === b) || (x.a === b && x.b === a);
        });
        cost += e ? e.w : 0;
      }
      return cost;
    }

    function entropy() {
      const ws = graph.edges.map(function (e) { return e.w; });
      const sum = ws.reduce(function (a, b) { return a + b; }, 0) || 1;
      let h = 0;
      ws.forEach(function (w) {
        const p = w / sum;
        h += -p * Math.log(p);
      });
      return h;
    }

    function runAlgorithm() {
      graph.pathNodes.clear();
      graph.pathEdgeSet.clear();
      graph.pathEdgeOrder = [];
      graph.exploreEvents = [];
      graph.finalNodeOrder = [];
      graph.pathCost = 0;
      graph.pathLength = 0;
      if (graph.nodes.length < 2) return;
      const src = Math.min(state.sourceNode, graph.nodes.length - 1);
      const dst = Math.max(0, state.latestNode);
      let res;
      const algo = state.algorithm === "aiml" ? "dijkstra" : state.algorithm;
      if (algo === "bfs") res = bfs(src, dst);
      else if (algo === "astar") res = astar(src, dst);
      else res = dijkstra(src, dst);
      graph.exploreEvents = res.events || [];
      const path = buildPath(res.prev, src, dst);
      if (!path.length) {
        graph.pathLength = 0;
        graph.pathCost = Infinity;
        graph.finalNodeOrder = [];
      } else {
        graph.pathLength = path.length ? path.length - 1 : 0;
        graph.pathCost = pathCost(path);
        graph.finalNodeOrder = path.slice();
        path.forEach(function (p) { graph.pathNodes.add(p); });
        for (let i = 0; i < path.length - 1; i += 1) {
          const k = edgeKey(path[i], path[i + 1]);
          graph.pathEdgeSet.add(k);
          graph.pathEdgeOrder.push(k);
        }
      }
      state.animStart = performance.now();
      state.animEdgeCount = 0;
    }

    function updateMetrics() {
      const costStr = Number.isFinite(graph.pathCost) ? graph.pathCost.toFixed(2) : "∞";
      let aiExtra = "";
      if (state.algorithm === "aiml" && state.aiStats) {
        const bestStr = Number.isFinite(state.aiStats.bestCost) ? state.aiStats.bestCost.toFixed(2) : "∞";
        aiExtra =
          "  |  ai: batch " +
          state.aiStats.batch +
          "/" +
          state.aiStats.batches +
          "  |  retries: " +
          state.aiStats.retries +
          "  |  best: " +
          bestStr +
          "  |  t: " +
          Math.round(state.aiStats.ms) +
          "ms";
      }

      metricsEl.innerHTML =
        "nodes: " +
        graph.nodes.length +
        "  |  edges: " +
        graph.edges.length +
        "  |  <span title=\"number of nodes traversed\">path: " +
        graph.pathLength +
        " hops</span>" +
        "  |  <span title=\"sum of edge weights along shortest path\">cost: " +
        costStr +
        "</span>" +
        "  |  <span title=\"Shannon entropy of edge weight distribution — measures graph randomness\">entropy: " +
        entropy().toFixed(2) +
        " bits</span>" +
        aiExtra;
    }

    function draw(ts) {
      const isLightMode =
        document.documentElement.getAttribute("data-theme") === "light" ||
        document.documentElement.classList.contains("light") ||
        document.body.classList.contains("light");
      const COLOR_IDLE = isLightMode ? "#1a1a2e" : "#ffffff";
      const COLOR_EXPLORED = isLightMode ? "#dc2626" : "#ef4444";
      const COLOR_PATH = isLightMode ? "#d97706" : "#facc15";
      const COLOR_NODE_PATH = isLightMode ? "#16a34a" : "#22c55e";
      const muted = getComputedStyle(document.documentElement).getPropertyValue("--text-muted").trim() || "#94a3b8";
      ctx.clearRect(0, 0, state.w, state.h);

      if (graph.nodes.length === 0) {
        const pulse = 0.22 + 0.28 * (0.5 + 0.5 * Math.sin(ts * 0.004));
        ctx.fillStyle = rgbaFromCss(muted, pulse);
        ctx.font = "11px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("click to add nodes", state.w * 0.5, state.h * 0.5);
        updateMetrics();
        return;
      }

      const elapsed = Math.max(0, ts - state.animStart);
      const exploreStep = Math.floor(elapsed / 30);
      const exploreDoneAt = graph.exploreEvents.length * 30;
      const pathElapsed = Math.max(0, elapsed - exploreDoneAt);
      const pathEdgeCount = Math.floor(pathElapsed / 80);
      const pathDoneAt = exploreDoneAt + graph.pathEdgeOrder.length * 80;
      const nodeElapsed = Math.max(0, elapsed - pathDoneAt);
      const pathNodeCount = Math.floor(nodeElapsed / 80);
      state.dashOffset -= 0.8;

      const visitedNow = new Set();
      const exploredEdgesNow = new Set();
      for (let i = 0; i < Math.min(exploreStep, graph.exploreEvents.length); i += 1) {
        const ev = graph.exploreEvents[i];
        if (ev.t === "node") visitedNow.add(ev.i);
        else if (ev.t === "edge") exploredEdgesNow.add(ev.k);
      }
      const pathEdgesNow = new Set(graph.pathEdgeOrder.slice(0, pathEdgeCount));
      const pathNodesNow = new Set(graph.finalNodeOrder.slice(0, pathNodeCount));
      const pathDirNow = new Map();
      for (let i = 0; i < Math.min(pathEdgeCount, Math.max(0, graph.finalNodeOrder.length - 1)); i += 1) {
        const from = graph.finalNodeOrder[i];
        const to = graph.finalNodeOrder[i + 1];
        pathDirNow.set(edgeKey(from, to), { from: from, to: to });
      }

      // edges
      graph.edges.forEach(function (e) {
        const a = graph.nodes[e.a];
        const b = graph.nodes[e.b];
        const k = edgeKey(e.a, e.b);
        const explored = exploredEdgesNow.has(k) && !graph.pathEdgeSet.has(k);
        const pathDrawn = pathEdgesNow.has(k);
        const hot = state.hoverNode >= 0 && (state.hoverNode === e.a || state.hoverNode === e.b);
        let stroke = rgbaFromCss(COLOR_IDLE, isLightMode ? 0.25 : 0.2);
        let width = 1;

        if (explored) {
          stroke = rgbaFromCss(COLOR_EXPLORED, isLightMode ? 0.45 : 0.5);
          width = 1;
        }
        if (graph.pathEdgeSet.size) {
          // keep non-path dim once a path exists
          if (!graph.pathEdgeSet.has(k) && !explored) {
            stroke = rgbaFromCss(COLOR_IDLE, 0.1);
          }
        }
        if (pathDrawn) {
          stroke = rgbaFromCss(COLOR_PATH, 1);
          width = 2.5;
        }
        if (hot && !pathDrawn) {
          stroke = rgbaFromCss(COLOR_IDLE, 0.45);
          width = 1.2;
        }

        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        if (pathDrawn) {
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = state.dashOffset;
        } else {
          ctx.setLineDash([]);
        }
        const dir = pathDirNow.get(k);
        ctx.beginPath();
        if (pathDrawn && dir) {
          const fromNode = graph.nodes[dir.from];
          const toNode = graph.nodes[dir.to];
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
        } else {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // nodes
      graph.nodes.forEach(function (n, i) {
        const inPathFinal = graph.pathNodes.has(i);
        const visited = visitedNow.has(i) && !inPathFinal;
        const isSource = i === state.sourceNode;
        const isDest = i === state.latestNode;
        const hot = i === state.hoverNode;
        const pathShown = pathNodesNow.has(i);

        let r = 8;
        let fill = rgbaFromCss(COLOR_IDLE, 1);
        let glow = 0;
        let glowColor = COLOR_IDLE;

        if (visited) {
          fill = rgbaFromCss(COLOR_EXPLORED, 1);
        }
        if (pathShown) {
          fill = rgbaFromCss(COLOR_NODE_PATH, 1);
          r = 10;
          glow = 8;
          glowColor = COLOR_NODE_PATH;
        }
        if (pathShown && (isSource || isDest)) {
          r = 12;
          glow = 12;
        }
        if (hot && !pathShown) r = 10;

        ctx.shadowBlur = glow;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ensure label contrast against node state/fill.
        let labelColor;
        if (visited) {
          labelColor = "#ffffff";
        } else if (pathShown || (isSource && pathShown) || (isDest && pathShown)) {
          labelColor = "#0a0a0f";
        } else {
          labelColor = isLightMode ? "#f5f5f0" : "#0a0a0f";
        }
        ctx.fillStyle = labelColor;
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(i), n.x, n.y);
      });

      // hover degree
      if (state.infoOverride) {
        infoEl.textContent = state.infoOverride;
      } else {
        if (state.hoverNode >= 0) {
          const deg = neighborsOf(state.hoverNode).length;
          infoEl.textContent = "degree: " + deg;
        } else if (state.sourceNode >= 0 && graph.nodes.length) {
          infoEl.textContent = "source: " + state.sourceNode;
        } else {
          infoEl.textContent = "";
        }
      }

      updateMetrics();
      ctx.fillStyle = rgbaFromCss(muted, 0.001);
      ctx.fillRect(0, 0, 1, 1);
    }

    function addRandomSet() {
      graph.nodes = [];
      const randomCount = 1 + Math.floor(Math.random() * 30);
      for (let i = 0; i < randomCount; i += 1) {
        addNode(
          24 + Math.random() * (state.w - 48),
          24 + Math.random() * (state.h - 48)
        );
      }
      state.sourceNode = 0;
      state.latestNode = graph.nodes.length - 1;
      rebuildEdges();
      runAlgorithm();
    }

    function clearAll() {
      graph.nodes = [];
      graph.edges = [];
      graph.pathNodes.clear();
      graph.pathEdgeSet.clear();
      graph.pathEdgeOrder = [];
      graph.exploreEvents = [];
      graph.finalNodeOrder = [];
      graph.pathCost = Infinity;
      graph.pathLength = 0;
      state.hoverNode = -1;
      state.sourceNode = 0;
      state.latestNode = -1;
    }

    function onCanvasClick(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idxNode = nodeAt(mx, my);
      if (idxNode >= 0) {
        state.sourceNode = idxNode;
        runAlgorithm();
        return;
      }
      addNode(mx, my);
    }

    function onRightClick(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idxNode = nodeAt(mx, my);
      if (idxNode < 0) return;
      graph.nodes.splice(idxNode, 1);
      if (state.sourceNode >= graph.nodes.length) state.sourceNode = Math.max(0, graph.nodes.length - 1);
      state.latestNode = graph.nodes.length - 1;
      rebuildEdges();
      runAlgorithm();
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      state.hoverNode = nodeAt(mx, my);
    }

    function loop(ts) {
      if (ts - state.lastFrame < 16) {
        window.requestAnimationFrame(loop);
        return;
      }
      state.lastFrame = ts;
      draw(ts);
      window.requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(function () {
      resize();
    });
    ro.observe(canvas);

    const mo = new MutationObserver(function () {
      state.theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    function deepCopyEdges(edges) {
      return edges.map(function (e) {
        return { a: e.a, b: e.b, d: e.d, w: e.w };
      });
    }

    function sleep(ms) {
      return new Promise(function (r) { return setTimeout(r, ms); });
    }

    async function startAiMode() {
      const token = (state.aiToken += 1);
      const startedAt = performance.now();
      state.aiStats = { batch: 0, batches: 0, retries: 0, bestCost: Infinity, ms: 0 };
      state.infoOverride = "ai/ml: initializing…";

      function alive() {
        return state.algorithm === "aiml" && token === state.aiToken;
      }

      function addBatch(count) {
        for (let i = 0; i < count; i += 1) {
          const x = 24 + Math.random() * (state.w - 48);
          const y = 24 + Math.random() * (state.h - 48);
          addNode(x, y);
        }
      }

      if (graph.nodes.length < 2) {
        addBatch(2 - graph.nodes.length);
      } else {
        runAlgorithm();
      }
      if (!alive()) return;

      // "Training budget" controls how big the experiment gets.
      // - higher budget => more nodes (up to 30) + more retries
      const b = Math.max(1, Math.min(10, state.aiBudget || 6));
      const targetNodes = Math.max(8, Math.min(30, 10 + b * 2 + Math.floor(Math.random() * 5))); // 12..30-ish
      const batchSize = Math.max(1, Math.min(6, state.aiBatchSize || 3));
      const batches = Math.max(1, Math.ceil(Math.max(0, targetNodes - graph.nodes.length) / batchSize));
      state.aiStats.batches = batches;

      let bestCost = Infinity;
      let bestEdges = deepCopyEdges(graph.edges);
      let bestTemp = state.temperature;
      let bestK = state.k;
      let bestNodeCount = graph.nodes.length;
      state.aiStats.bestCost = Infinity;
      let foundAny = false;

      for (let b = 0; b < batches; b += 1) {
        if (!alive()) return;
        state.aiStats.batch = b + 1;

        const toAdd = Math.min(batchSize, Math.max(0, targetNodes - graph.nodes.length));
        if (toAdd > 0) addBatch(toAdd);
        if (!alive()) return;

        const localRetries = 3 + Math.floor((Math.max(1, Math.min(10, state.aiBudget || 6)) * 2)); // 5..23
        for (let r = 0; r < localRetries; r += 1) {
          if (!alive()) return;
          state.aiStats.retries += 1;

          const baseTemp = state.temperature;
          const jitter = (Math.random() - 0.5) * 0.25;
          state.temperature = Math.max(0, Math.min(1, baseTemp + jitter));
          if (Math.random() < 0.18) {
            state.k = Math.max(1, Math.min(5, state.k + (Math.random() < 0.5 ? -1 : 1)));
          }
          // If we're disconnected, bias toward denser graphs to create bridges.
          if (!graph.finalNodeOrder.length) state.k = 5;

          rebuildEdges();
          runAlgorithm();

          const costNow = Number.isFinite(graph.pathCost) ? graph.pathCost : Infinity;
          if (graph.finalNodeOrder.length && costNow < bestCost) {
            bestCost = costNow;
            bestEdges = deepCopyEdges(graph.edges);
            bestTemp = state.temperature;
            bestK = state.k;
            state.aiStats.bestCost = bestCost;
            bestNodeCount = graph.nodes.length;
            foundAny = true;
          }

          state.aiStats.ms = performance.now() - startedAt;
          state.infoOverride =
            "ai/ml: learning… best=" +
            (Number.isFinite(bestCost) ? bestCost.toFixed(2) : "∞") +
            "  (temp=" +
            bestTemp.toFixed(2) +
            ", k=" +
            bestK +
            ", nodes=" +
            graph.nodes.length +
            "/" +
            targetNodes +
            ", budget=" +
            b +
            ")";
          await sleep(70);
        }

        // Apply the best snapshot only if it matches current node count; otherwise rebuild.
        state.temperature = bestTemp;
        state.k = bestK;
        if (foundAny && graph.nodes.length === bestNodeCount) {
          graph.edges = deepCopyEdges(bestEdges);
        } else {
          rebuildEdges();
        }
        runAlgorithm();
      }

      if (!alive()) return;
      state.aiStats.ms = performance.now() - startedAt;
      const hasPathNow = graph.finalNodeOrder.length > 0 && Number.isFinite(graph.pathCost);
      state.infoOverride = hasPathNow
        ? ("ai/ml: converged — best=" +
          (Number.isFinite(bestCost) ? bestCost.toFixed(2) : "∞") +
          " in " +
          Math.round(state.aiStats.ms) +
          "ms")
        : "ai/ml: no path found — graph is disconnected (add nodes / increase K)";
    }

    algoBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        state.algorithm = b.getAttribute("data-algo") || "dijkstra";
        algoBtns.forEach(function (x) {
          x.classList.toggle("is-active", x === b);
        });
        state.infoOverride = "";
        state.aiToken += 1; // cancel any running AI loop
        state.aiStats = null;
        if (state.algorithm === "aiml") {
          // Always restart from zero when selecting AI/ML.
          clearAll();
          // Reset to defaults for a fresh "training run".
          state.temperature = 0.4;
          state.k = 2;
          tempInput.value = String(state.temperature);
          tempVal.textContent = state.temperature.toFixed(1);
          kInput.value = String(state.k);
          kVal.textContent = String(state.k);
          startAiMode();
        }
        else runAlgorithm();
      });
    });

    if (aiBudgetInput && aiBudgetVal) {
      aiBudgetVal.textContent = String(state.aiBudget);
      aiBudgetInput.addEventListener("input", function () {
        state.aiBudget = Number(aiBudgetInput.value);
        aiBudgetVal.textContent = String(state.aiBudget);
      });
    }

    if (aiBatchInput && aiBatchVal) {
      aiBatchVal.textContent = String(state.aiBatchSize);
      aiBatchInput.addEventListener("input", function () {
        state.aiBatchSize = Number(aiBatchInput.value);
        aiBatchVal.textContent = String(state.aiBatchSize);
      });
    }

    tempInput.addEventListener("input", function () {
      state.temperature = Number(tempInput.value);
      tempVal.textContent = state.temperature.toFixed(1);
      rebuildEdges();
      runAlgorithm();
    });

    kInput.addEventListener("input", function () {
      state.k = Number(kInput.value);
      kVal.textContent = String(state.k);
      rebuildEdges();
      runAlgorithm();
    });

    clearBtn.addEventListener("click", function () {
      state.aiToken += 1;
      state.aiStats = null;
      state.infoOverride = "";
      clearAll();
    });
    randomBtn.addEventListener("click", function () {
      state.aiToken += 1;
      state.aiStats = null;
      state.infoOverride = "";
      addRandomSet();
    });

    canvas.addEventListener("click", onCanvasClick);
    canvas.addEventListener("contextmenu", onRightClick);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", function () {
      state.hoverNode = -1;
    }, { passive: true });

    resize();
    state.lastFrame = performance.now();
    window.requestAnimationFrame(loop);
  }
  typeNameOnce();
  initScrollSpy();
  initNavClick();
  initThemeToggle();
  initGraphColumnToggle();
  initEmbeddingSpace();
})();
