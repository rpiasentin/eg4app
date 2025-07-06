const API = "/api";

async function fetchStatus() {
  const res = await fetch(API + "/status");
  return await res.json();
}

async function fetchHistory() {
  const res = await fetch(API + "/history");
  return await res.json();
}

async function fetchActions() {
  const res = await fetch(API + "/actions");
  return await res.json();
}

function renderStatus(s) {
  document.getElementById("status").innerText =
    `Battery: ${s.battery_voltage.toFixed(2)} V  |  Absorb: ${s.absorb_voltage} V  |  Float: ${s.float_voltage} V`;
  document.getElementById("absorb").value = s.absorb_voltage;
  document.getElementById("float").value = s.float_voltage;
}

function renderActions(actions) {
  const ul = document.getElementById("actions");
  ul.innerHTML = "";
  if (actions.length === 0) {
    ul.innerHTML = "<li class='gray'>No actions taken yet.</li>";
    return;
  }
  actions.slice().reverse().forEach(a => {
    const date = new Date(a.timestamp * 1000).toLocaleString();
    let text = `[${date}] ${a.action}`;
    if (a.absorb !== undefined && a.float !== undefined)
      text += ` — Absorb: ${a.absorb} V, Float: ${a.float} V`;
    const li = document.createElement("li");
    li.className = "mb1";
    li.textContent = text;
    ul.appendChild(li);
  });
}

async function init() {
  const st = await fetchStatus();
  renderStatus(st);

  const hist = await fetchHistory();
  const ctx = document.getElementById("vgraph").getContext("2d");
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: hist.map(p => new Date(p.t * 1000).toLocaleTimeString()),
      datasets: [{
        label: 'Voltage',
        data: hist.map(p => p.v),
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: false } }
    }
  });

  const actions = await fetchActions();
  renderActions(actions);
}

document.getElementById("setbtn").addEventListener("click", async () => {
  const absorb = parseFloat(document.getElementById("absorb").value);
  const flt = parseFloat(document.getElementById("float").value);
  await fetch(API + "/setpoints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ absorb, float: flt })
  });
  const st = await fetchStatus();
  renderStatus(st);
  const actions = await fetchActions();
  renderActions(actions);
});

init();
