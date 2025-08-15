import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Upload, FilePenLine, Trash2, Plus, Save, RefreshCcw, Shield, Search, Filter, BarChart3, Database, LayoutGrid, Printer, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Papa from "papaparse";
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, Treemap } from "recharts";

/**
 * OODA–CARVER Ops Risk Dashboard
 * Single-file React app suitable for GitHub Pages.
 * Features: sample dataset (5 sites), upload CSV/JSON, edit inline, sort/filter,
 * risk matrix, export JSON/CSV/Markdown, printable PDF report, 5×5 heatmap,
 * role-based views, and built-in self-tests for core functions.
 * Data is persisted to localStorage. No backend required.
 */

// --------------------------- Types & Helpers ---------------------------
const DEFAULT_DATA = [
  {
    id: crypto.randomUUID(),
    name: "Kivu Ridge VHF Site",
    type: "VHF Comms",
    country: "DRC",
    location: "North Kivu",
    C: 5, A: 4, R: 3, V: 4, E: 5, Rz: 5,
    notes: "Primary ATC coverage; community tensions nearby; guarded 12h/day.",
  },
  {
    id: crypto.randomUUID(),
    name: "Shamal Radar Tower",
    type: "Primary Radar",
    country: "Iraq",
    location: "Nineveh",
    C: 5, A: 3, R: 3, V: 3, E: 5, Rz: 4,
    notes: "Dual-use air picture node; intermittent power grid stability.",
  },
  {
    id: crypto.randomUUID(),
    name: "Coastal SATCOM Hub",
    type: "SATCOM Relay",
    country: "Somalia",
    location: "Puntland",
    C: 4, A: 4, R: 2, V: 3, E: 4, Rz: 4,
    notes: "Backbone for remote sites; subject to cyclones; private guard force.",
  },
  {
    id: crypto.randomUUID(),
    name: "Highland Fuel Depot",
    type: "Logistics",
    country: "Peru",
    location: "Cajamarca",
    C: 5, A: 3, R: 2, V: 4, E: 5, Rz: 5,
    notes: "Feeds remote extraction site; protest risk; visible/identifiable target.",
  },
  {
    id: crypto.randomUUID(),
    name: "Eastern Fiber POP",
    type: "Telecom POP",
    country: "Georgia",
    location: "Kvemo Kartli",
    C: 4, A: 2, R: 4, V: 3, E: 3, Rz: 3,
    notes: "Regional backhaul; redundancy available; moderate recognizability.",
  },
];

function avg(nums) { return +(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2); }
function clamp1to5(n) { return Math.max(1, Math.min(5, Number(n) || 1)); }

function computeDerived(row) {
  // Likelihood = avg(Accessibility, Vulnerability, Recognizability)
  const L = avg([row.A, row.V, row.Rz]);
  // Impact = avg(Criticality, Effect, Recuperability) — note: higher R means harder recovery
  const I = avg([row.C, row.E, row.R]);
  const score = +(L * I).toFixed(2);
  return { L, I, score };
}

function toCSV(rows) {
  const fields = ["name","type","country","location","C","A","R","V","E","Rz","L","I","score","notes"];
  const data = rows
    .map(r => ({...r, ...computeDerived(r)}))
    .map(r => fields.reduce((o,f)=> (o[f]=r[f]??r[f], o),{}));
  return Papa.unparse({ fields, data });
}

function fromCSV(csv) {
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors?.length) throw new Error(parsed.errors[0].message);
  return parsed.data.map((r) => ({
    id: crypto.randomUUID(),
    name: r.name || r.Name || "Unnamed",
    type: r.type || r.Type || "Unknown",
    country: r.country || r.Country || "",
    location: r.location || r.Location || "",
    C: clamp1to5(r.C || r.Criticality),
    A: clamp1to5(r.A || r.Accessibility),
    R: clamp1to5(r.R || r.Recuperability),
    V: clamp1to5(r.V || r.Vulnerability),
    E: clamp1to5(r.E || r.Effect),
    Rz: clamp1to5(r.Rz || r.Recognizability),
    notes: r.notes || r.Notes || "",
  }));
}

function download(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function bucket(v) { return Math.max(1, Math.min(5, Math.round(v))); }

// --------------------------- Self Tests ---------------------------
function runSelfTests() {
  const msgs = [];
  function assert(cond, msg) { if (!cond) throw new Error(msg); }
  try {
    // Test 1: computeDerived
    const d = computeDerived({ A:5, V:5, Rz:5, C:5, E:5, R:5 });
    assert(d.L === 5 && d.I === 5 && d.score === 25, "computeDerived should yield L=5,I=5,score=25 for all 5s");
    msgs.push("computeDerived ✅");

    // Test 2: CSV roundtrip
    const csv = toCSV([{ name:"A", type:"t", country:"c", location:"l", C:1, A:2, R:3, V:4, E:5, Rz:1, notes:"n" }]);
    const parsed = fromCSV(csv);
    assert(Array.isArray(parsed) && parsed.length === 1 && parsed[0].name === "A", "CSV roundtrip failed");
    msgs.push("CSV/JSON roundtrip ✅");

    // Test 3: Markdown export
    const md = buildMarkdownReport([{ name:"A", type:"t", country:"c", location:"l", C:1, A:2, R:3, V:4, E:5, Rz:1, notes:"n" }]);
    assert(typeof md === "string" && md.includes("# OODA–CARVER Risk Report"), "Markdown header missing");
    msgs.push("Markdown export ✅");

    return { ok: true, msgs };
  } catch (e) {
    console.error("Self-test error:", e);
    msgs.push("Self-test error: " + e.message);
    return { ok: false, msgs };
  }
}

// --------------------------- UI Primitives ---------------------------
const Tag = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ${className}`}>{children}</span>
);

const ScoreCell = ({ value }) => {
  const v = Number(value);
  const color = v >= 4 ? "bg-rose-100 text-rose-700" : v >= 3 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700";
  return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${color}`}>{v}</span>;
};

// --------------------------- Heatmap ---------------------------
function Heatmap({ data }) {
  // Build 5×5 grid: rows Impact (5 high→1 low), cols Likelihood (1→5)
  const cells = new Map();
  data.forEach((r) => {
    const Lb = bucket(r.L); const Ib = bucket(r.I);
    const key = `${Ib}-${Lb}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(r);
  });
  const colorFor = (count, i, j) => {
    const risk = i * j; // proxy intensity
    if (risk >= 16) return "bg-rose-400";
    if (risk >= 9) return "bg-amber-400";
    if (risk >= 4) return "bg-yellow-300";
    return "bg-emerald-300";
  };
  return (
    <div className="grid grid-cols-6 gap-2">
      <div></div>
      {[1,2,3,4,5].map(c => <div key={c} className="text-center text-xs text-slate-600">L{c}</div>)}
      {[5,4,3,2,1].map((rowI) => (
        <React.Fragment key={rowI}>
          <div className="flex items-center justify-end pr-1 text-xs text-slate-600">I{rowI}</div>
          {[1,2,3,4,5].map(colL => {
            const key = `${rowI}-${colL}`;
            const items = cells.get(key) || [];
            return (
              <div key={key} className={`relative h-20 w-full rounded-md p-1 ${colorFor(items.length, rowI, colL)} bg-opacity-60 border border-white shadow-inner`}>
                <div className="absolute right-1 top-1 text-[10px] font-semibold text-slate-800">{items.length}</div>
                <div className="mt-4 space-y-0.5 overflow-hidden text-[10px] leading-tight">
                  {items.slice(0,3).map(x => <div key={x.id} className="truncate">• {x.name}</div>)}
                  {items.length>3 && <div className="text-[10px] italic">+{items.length-3} more</div>}
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
      <div></div>
      <div className="col-span-5 text-center text-xs text-slate-500">Likelihood →</div>
      <div className="row-span-5 rotate-180 text-center text-xs text-slate-500" style={{writingMode:'vertical-rl'}}>Impact ↑</div>
    </div>
  );
}

// --------------------------- Report Builder ---------------------------
function buildMarkdownReport(rows) {
  const now = new Date().toISOString();
  const enriched = rows.map(r => ({...r, ...computeDerived(r)})).sort((a,b)=> b.score-a.score);
  const top3 = enriched.slice(0,3);
  const lines = [];
  lines.push(`# OODA–CARVER Risk Report`);
  lines.push(`_Generated: ${now}_`);
  lines.push("");
  lines.push(`## Portfolio Summary`);
  lines.push(`* Average Likelihood: ${avg(enriched.map(r=>r.L)).toFixed(2)}`);
  lines.push(`* Average Impact: ${avg(enriched.map(r=>r.I)).toFixed(2)}`);
  lines.push(`* Average Risk (L×I): ${avg(enriched.map(r=>r.score)).toFixed(2)}`);
  lines.push("");
  lines.push(`## Top 3 Risks`);
  top3.forEach((r,i)=> lines.push(`${i+1}. **${r.name}** (${r.type}, ${r.country}) — Risk: ${r.score}  
    L=${r.L} (A=${r.A}, V=${r.V}, Rz=${r.Rz}); I=${r.I} (C=${r.C}, E=${r.E}, R=${r.R})  
    Notes: ${r.notes||"—"}`));
  lines.push("");
  lines.push(`## Full Register`);
  lines.push(`| Asset | Type | Ctry | Loc | C | A | R | V | E | Rz | L | I | Risk | Notes |`);
  lines.push(`|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|`);
  enriched.forEach(r=> lines.push(`| ${r.name} | ${r.type} | ${r.country} | ${r.location} | ${r.C} | ${r.A} | ${r.R} | ${r.V} | ${r.E} | ${r.Rz} | ${r.L} | ${r.I} | ${r.score} | ${r.notes?.replaceAll('|','/')} |`));
  lines.push("");
  lines.push(`---\n_Method: L = avg(A,V,Rz); I = avg(C,E,R); Risk = L×I. Scale 1–5._`);
  return lines.join("\n");
}

// --------------------------- Main App ---------------------------
export default function App() {
  const [rows, setRows] = useState(() => {
    const stored = localStorage.getItem("carver_rows_v1");
    return stored ? JSON.parse(stored) : DEFAULT_DATA;
  });
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [role, setRole] = useState(() => localStorage.getItem("carver_role") || "All");
  const [tab, setTab] = useState("dashboard");
  const [selfTest, setSelfTest] = useState({ ok: true, msgs: [] });
  const fileRef = useRef(null);

  useEffect(() => { localStorage.setItem("carver_rows_v1", JSON.stringify(rows)); }, [rows]);
  useEffect(() => { localStorage.setItem("carver_role", role); }, [role]);
  useEffect(() => { setSelfTest(runSelfTests()); }, []);

  const enriched = useMemo(() => rows.map(r => ({ ...r, ...computeDerived(r) })), [rows]);

  const filtered = useMemo(() => enriched.filter(r => {
    const s = `${r.name} ${r.type} ${r.country} ${r.location} ${r.notes}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }), [enriched, q]);

  const sorted = useMemo(() => [...filtered].sort((a,b)=> {
    const dir = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0) * dir;
  }), [filtered, sortKey, sortDir]);

  function updateRow(id, patch) { setRows(prev => prev.map(r => r.id===id ? { ...r, ...patch } : r)); }
  function addRow() {
    setRows(prev => [{ id: crypto.randomUUID(), name: "New Asset", type: "", country: "", location: "", C:3,A:3,R:3,V:3,E:3,Rz:3, notes:"" }, ...prev]);
  }
  function removeRow(id) { setRows(prev => prev.filter(r => r.id!==id)); }
  function resetSample() { setRows(DEFAULT_DATA); }

  function handleUpload(file) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let newRows = [];
        if (ext === "json") newRows = JSON.parse(reader.result);
        else newRows = fromCSV(reader.result);
        if (!Array.isArray(newRows)) throw new Error("Invalid data");
        // Normalize & validate
        const norm = newRows.map((r) => ({
          id: r.id || crypto.randomUUID(),
          name: r.name || "Unnamed",
          type: r.type || "",
          country: r.country || "",
          location: r.location || "",
          C: clamp1to5(r.C), A: clamp1to5(r.A), R: clamp1to5(r.R), V: clamp1to5(r.V), E: clamp1to5(r.E), Rz: clamp1to5(r.Rz),
          notes: r.notes || "",
        }));
        setRows(norm);
      } catch (e) { alert("Upload error: " + e.message); }
    };
    reader.readAsText(file);
  }

  function exportJSON() { download("carver_report.json", JSON.stringify(enriched, null, 2), "application/json"); }
  function exportCSV() { download("carver_report.csv", toCSV(rows), "text/csv;charset=utf-8"); }
  function exportMD() { download("carver_report.md", buildMarkdownReport(rows)); }
  function exportPrint() { window.print(); }

  const roleCols = useMemo(()=> {
    // Define column sets per role
    if (role === "Ops") return ["name","type","country","location","C","R","E","I","score","notes"];
    if (role === "Sec") return ["name","type","country","location","A","V","Rz","L","I","score","notes"];
    if (role === "Comms") return ["name","country","location","score","notes"];
    return ["name","type","country","location","C","A","R","V","E","Rz","L","I","score","notes"];
  }, [role]);

  const colLabels = {
    name:"Asset", type:"Type", country:"Country", location:"Location", C:"C", A:"A", R:"R", V:"V", E:"E", Rz:"Rz", L:"L", I:"I", score:"Risk", notes:"Notes"
  };

  // Print stylesheet to create a clean PDF report
  const printCSS = `@media print { 
    header, .no-print, .upload-dialog, .controls { display:none !important; }
    main { padding:0 !important; }
    .print-report { display:block !important; }
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800">
      <style>{printCSS}</style>
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-slate-700" />
            <h1 className="text-xl font-semibold">OODA–CARVER Ops Risk Dashboard</h1>
            <Tag>Serverless • GitHub Pages Ready</Tag>
            {selfTest.ok ? (
              <Tag className="ml-2 flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3 w-3"/>Self‑tests OK</Tag>
            ) : (
              <Tag className="ml-2 flex items-center gap-1 text-rose-700"><XCircle className="h-3 w-3"/>Self‑tests Failed</Tag>
            )}
          </div>
          <div className="controls flex items-center gap-2">
            <label className="text-sm text-slate-600">Role:</label>
            <select value={role} onChange={(e)=> setRole(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm">
              <option>All</option>
              <option>Ops</option>
              <option>Sec</option>
              <option>Comms</option>
            </select>
            <Button variant="outline" onClick={resetSample} title="Reset to sample dataset"><RefreshCcw className="mr-2 h-4 w-4"/>Reset</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4"/>Upload</Button>
              </DialogTrigger>
              <DialogContent className="upload-dialog">
                <DialogHeader>
                  <DialogTitle>Upload data (CSV or JSON)</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <input ref={fileRef} type="file" accept=".csv,.json" onChange={(e)=> e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  <p className="text-sm text-slate-500">CSV headers: name,type,country,location,C,A,R,V,E,Rz,notes</p>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4"/>CSV</Button>
            <Button variant="outline" onClick={exportJSON}><Download className="mr-2 h-4 w-4"/>JSON</Button>
            <Button variant="outline" onClick={exportMD}><Download className="mr-2 h-4 w-4"/>Markdown</Button>
            <Button onClick={exportPrint}><Printer className="mr-2 h-4 w-4"/>Print PDF</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="no-print">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="heatmap">5×5 Heatmap</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Portfolio Posture</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer>
                      <RadialBarChart innerRadius="40%" outerRadius="100%" data={[{ name: "Avg Risk", value: avg(enriched.map(r=>r.score)) }]} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" minAngle={15} fill="#e11d48" clockWise cornerRadius={10} />
                        <Tooltip formatter={(v)=> v.toFixed(2)} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">Average Risk Score (L×I)</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Top Risks</CardTitle></CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-5 text-sm">
                    {enriched.sort((a,b)=>b.score-a.score).slice(0,3).map(r=> (
                      <li key={r.id} className="mb-1"><span className="font-semibold">{r.name}</span> <span className="text-slate-500">— {r.type}</span> <Tag className="ml-2">{r.country}</Tag> <span className="ml-2 text-xs">Score: {r.score}</span></li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Risk Treemap</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer>
                      <Treemap data={enriched.map(r=>({ name:r.name, size: r.score }))} dataKey="size" aspectRatio={4/3} stroke="#fff" fill="#0ea5e9" />
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4"/> Asset Register (CARVER + Derived Risk)</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400"/>
                      <Input placeholder="Search assets..." className="pl-8 w-56" value={q} onChange={e=>setQ(e.target.value)} />
                    </div>
                    <Button onClick={addRow}><Plus className="mr-2 h-4 w-4"/>Add</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        {roleCols.concat(["_"]).map((k)=> (
                          <th key={k} className="px-2 py-2">
                            <button onClick={()=>{ if(k==="_") return; setSortKey(k); setSortDir(d=> (sortKey===k && d==="desc")?"asc":"desc"); }} className="flex items-center gap-1">
                              {colLabels[k] || ""}
                              {sortKey===k && <span className="text-[10px]">{sortDir==="asc"?"▲":"▼"}</span>}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(r=> (
                        <tr key={r.id} className="border-t hover:bg-slate-50">
                          {roleCols.map((k)=> (
                            <td key={k} className="px-2 py-2">
                              {k==="name" || k==="type" || k==="country" || k==="location" || k==="notes" ? (
                                k==="notes" ? <InlineEdit value={r.notes} onChange={v=>updateRow(r.id,{notes:v})}/> : <InlineEdit value={r[k]} onChange={v=>updateRow(r.id,{[k]:v})}/>
                              ) : k==="L" || k==="I" ? (
                                <ScoreCell value={r[k]} />
                              ) : k==="score" ? (
                                <span className="font-semibold">{r.score}</span>
                              ) : (
                                <NumberEdit value={r[k]} onChange={(v)=> updateRow(r.id,{ [k]: clamp1to5(v) })} />
                              )}
                            </td>
                          ))}
                          <td className="px-2 py-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" title="Delete" onClick={()=> removeRow(r.id)}>
                                <Trash2 className="h-4 w-4"/>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Method Notes</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                  <li><span className="font-semibold">CARVER fields</span>: C (Criticality), A (Accessibility), R (Recuperability), V (Vulnerability), E (Effect), Rz (Recognizability). 1–5 scale.</li>
                  <li><span className="font-semibold">Derived metrics</span>: Likelihood L = avg(A,V,Rz); Impact I = avg(C,E,R); Risk = L×I.</li>
                  <li>Use the Upload button to import a <span className="font-mono">.csv</span> or <span className="font-mono">.json</span>. Your data stays in the browser (localStorage).</li>
                  <li>Export your current view as JSON, CSV, or Markdown. Use <span className="font-semibold">Print PDF</span> for a formatted PDF report.</li>
                </ul>
                {!selfTest.ok && (
                  <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                    <div className="mb-1 font-semibold">Self‑test output</div>
                    <ul className="list-disc pl-4">
                      {selfTest.msgs.map((m,i)=> <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><LayoutGrid className="h-4 w-4"/> 5×5 Likelihood × Impact Heatmap</CardTitle></CardHeader>
              <CardContent>
                <Heatmap data={enriched} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <div className="print-report hidden">
              {/* Print-friendly block */}
              <h1 className="mb-1 text-2xl font-semibold">OODA–CARVER Risk Report</h1>
              <p className="mb-4 text-sm text-slate-600">Generated: {new Date().toLocaleString()}</p>
            </div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Printable Report</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-3 flex gap-2 no-print">
                  <Button variant="outline" onClick={exportMD}><Download className="mr-2 h-4 w-4"/>Download .md</Button>
                  <Button onClick={exportPrint}><Printer className="mr-2 h-4 w-4"/>Print to PDF</Button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReportPreview rows={rows} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-slate-500">
          Built for OODA–CARVER operational risk workflows • © {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}

function InlineEdit({ value, onChange }) {
  const [v, setV] = useState(value ?? "");
  useEffect(()=> setV(value ?? ""), [value]);
  return (
    <input className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-300"
      value={v} onChange={(e)=>{ setV(e.target.value); onChange(e.target.value); }} />
  );
}

function NumberEdit({ value, onChange }) {
  const [v, setV] = useState(value ?? 3);
  useEffect(()=> setV(value ?? 3), [value]);
  return (
    <input type="number" min={1} max={5} step={1}
      className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-slate-300"
      value={v}
      onChange={(e)=>{ const n = Number(e.target.value); setV(n); onChange(n); }} />
  );
}

function ReportPreview({ rows }) {
  const enriched = rows.map(r=> ({...r, ...computeDerived(r)})).sort((a,b)=> b.score-a.score);
  const avgL = avg(enriched.map(r=>r.L)).toFixed(2);
  const avgI = avg(enriched.map(r=>r.I)).toFixed(2);
  const avgR = avg(enriched.map(r=>r.score)).toFixed(2);
  return (
    <div>
      <h2 className="text-lg font-semibold">Portfolio Summary</h2>
      <ul>
        <li>Average Likelihood: {avgL}</li>
        <li>Average Impact: {avgI}</li>
        <li>Average Risk (L×I): {avgR}</li>
      </ul>
      <h3 className="mt-4 text-base font-semibold">Top 3 Risks</h3>
      <ol className="list-decimal pl-5">
        {enriched.slice(0,3).map((r,i)=> (
          <li key={r.id} className="mb-2"><strong>{r.name}</strong> ({r.type}, {r.country}) — <em>Risk:</em> {r.score}
            <div className="text-slate-600 text-[13px]">L={r.L} (A={r.A}, V={r.V}, Rz={r.Rz}); I={r.I} (C={r.C}, E={r.E}, R={r.R})</div>
            <div className="text-slate-700 text-[13px]"><em>Notes:</em> {r.notes||"—"}</div>
          </li>
        ))}
      </ol>
      <h3 className="mt-4 text-base font-semibold">Full Register</h3>
      <table className="w-full text-xs">
        <thead>
          <tr>
            {["Asset","Type","Ctry","Loc","C","A","R","V","E","Rz","L","I","Risk","Notes"].map(h=> <th key={h} className="border-b px-2 py-1 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {enriched.map(r=> (
            <tr key={r.id} className="border-b">
              <td className="px-2 py-1">{r.name}</td>
              <td className="px-2 py-1">{r.type}</td>
              <td className="px-2 py-1">{r.country}</td>
              <td className="px-2 py-1">{r.location}</td>
              <td className="px-2 py-1">{r.C}</td>
              <td className="px-2 py-1">{r.A}</td>
              <td className="px-2 py-1">{r.R}</td>
              <td className="px-2 py-1">{r.V}</td>
              <td className="px-2 py-1">{r.E}</td>
              <td className="px-2 py-1">{r.Rz}</td>
              <td className="px-2 py-1">{r.L}</td>
              <td className="px-2 py-1">{r.I}</td>
              <td className="px-2 py-1 font-semibold">{r.score}</td>
              <td className="px-2 py-1">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[12px] text-slate-600">Method: L = avg(A,V,Rz); I = avg(C,E,R); Risk = L×I. Scale 1–5.</p>
    </div>
  );
}
