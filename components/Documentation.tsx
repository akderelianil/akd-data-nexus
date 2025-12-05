
import React from 'react';
import { 
  Database, 
  Server, 
  Code, 
  FileSpreadsheet, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  FileJson,
  Check,
  Terminal,
  BookOpen,
  PenTool,
  Merge,
  FileInput
} from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">System Architecture</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          A deep dive into the technical design, sanitization logic, and data flow of the AKD Data Nexus Bronze Layer ETL.
        </p>
      </div>

      {/* 1. Architecture Diagram (Visual) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Cpu className="w-5 h-5" /></div>
          <h2 className="text-2xl font-bold">Data Flow Pipeline</h2>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            
            {/* Step 1: Client */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-20 h-20 bg-background border-2 border-border rounded-2xl flex items-center justify-center shadow-sm group-hover:border-primary group-hover:shadow-md transition-all relative">
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Client Workstation</h3>
                <p className="text-xs text-muted-foreground">React SPA</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-col items-center">
              <div className="text-[10px] font-mono text-muted-foreground mb-1">Multipart POST</div>
              <div className="h-0.5 w-24 bg-border relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-primary animate-[shimmer_1.5s_infinite]" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-[-9px] ml-24" />
            </div>
            <ArrowRight className="md:hidden w-6 h-6 text-muted-foreground rotate-90" />

            {/* Step 2: Server */}
            <div className="flex flex-col items-center text-center space-y-3 group">
               <div className="w-24 h-24 bg-background border-2 border-primary/50 rounded-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <Server className="w-10 h-10 text-primary mb-1" />
                <span className="text-[10px] font-mono font-bold">Go Core</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">AKD Backend</h3>
                <p className="text-xs text-muted-foreground">Sanitizer & Parser</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex flex-col items-center">
              <div className="text-[10px] font-mono text-muted-foreground mb-1">Batch Insert</div>
              <div className="h-0.5 w-24 bg-border relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-primary animate-[shimmer_1.5s_infinite_0.5s]" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-[-9px] ml-24" />
            </div>
            <ArrowRight className="md:hidden w-6 h-6 text-muted-foreground rotate-90" />

            {/* Step 3: DB */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-20 h-20 bg-background border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-emerald-500 group-hover:shadow-md transition-all relative">
                <Database className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">MotherDuck</h3>
                <p className="text-xs text-muted-foreground">Cloud Warehouse</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Tech Stack */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layers className="w-5 h-5" /></div>
          <h2 className="text-2xl font-bold">Technology Stack</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { name: 'Go (Golang)', role: 'Backend Runtime', icon: Terminal, color: 'text-cyan-500' },
                { name: 'React + Vite', role: 'Frontend UI', icon: Code, color: 'text-blue-500' },
                { name: 'MotherDuck', role: 'Data Warehouse', icon: Database, color: 'text-emerald-500' },
                { name: 'DuckDB', role: 'In-Memory SQL', icon: Zap, color: 'text-yellow-500' },
            ].map((tech) => (
                <div key={tech.name} className="bg-card border border-border p-4 rounded-xl hover:bg-muted/50 transition-colors">
                    <tech.icon className={`w-8 h-8 ${tech.color} mb-3`} />
                    <div className="font-bold text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.role}</div>
                </div>
            ))}
        </div>
      </section>

      {/* 3. Sanitization Rules */}
      <section className="space-y-6">
         <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShieldCheck className="w-5 h-5" /></div>
          <h2 className="text-2xl font-bold">Bronze Layer Integrity</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    The system acts as a strict gatekeeper for the Data Warehouse. Before any data enters the Bronze Layer, header columns are normalized to ensure SQL compatibility and consistency across all sources.
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Transformation Rules</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500"/> Turkish Chars → Latin (e.g., <strong>ü</strong> to <strong>u</strong>)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500"/> Spaces/Symbols → Underscores</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500"/> Lowercase Conversion</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500"/> All Columns → <strong>VARCHAR</strong> Type</li>
                    </ul>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                <div className="bg-muted/50 px-4 py-2 border-b border-border text-xs font-mono text-muted-foreground">Sanitizer.go Preview</div>
                <div className="flex-1 p-6 flex flex-col justify-center gap-4">
                    {/* Before */}
                    <div className="flex items-center gap-3 opacity-60">
                        <span className="w-16 text-xs font-bold text-red-500 text-right">INPUT</span>
                        <div className="px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-sm rounded border border-red-500/20 w-full line-through">
                            Sipariş Tarihi & No.
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90 md:rotate-0" />
                    </div>
                    {/* After */}
                    <div className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-emerald-500 text-right">OUTPUT</span>
                        <div className="px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-sm rounded border border-emerald-500/20 w-full font-bold">
                            siparis_tarihi_no
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Manual Fields Strategy */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><PenTool className="w-5 h-5" /></div>
          <h2 className="text-2xl font-bold">Manual Input Strategy</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
           <div className="space-y-4">
             <h3 className="font-semibold text-lg">Solving the "Context Gap"</h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               Raw data exports from portals (like Amazon or Trendyol) often contain the <i>data</i> but lack the <i>metadata</i> needed for analysis.
             </p>
             <p className="text-sm text-muted-foreground leading-relaxed">
               For example, a file named <code>sales_export.csv</code> might contain 1000 rows of transactions but <strong>no column indicating the report date</strong> or the <strong>store region</strong>. Without this, historical analysis is impossible.
             </p>
             
             <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
               <h4 className="font-semibold text-amber-600 dark:text-amber-500 text-sm mb-2">How it works:</h4>
               <ul className="text-sm space-y-2 text-muted-foreground">
                 <li className="flex items-start gap-2">
                   <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-1.5 rounded mt-0.5">1</span>
                   <span>Admin defines missing fields (e.g., 'Report Date') in Config.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-1.5 rounded mt-0.5">2</span>
                   <span>User is prompted to enter values during ingestion.</span>
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-1.5 rounded mt-0.5">3</span>
                   <span>System appends these values to <strong>every row</strong> of the file before DB insertion.</span>
                 </li>
               </ul>
             </div>
           </div>

           {/* Visual Diagram of Merge */}
           <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
              {/* Top: File Data */}
              <div className="flex items-center gap-3">
                 <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                 <div className="flex-1 bg-muted/50 rounded p-2 text-xs font-mono grid grid-cols-2 gap-2">
                    <div className="bg-background border border-border p-1 rounded">ID: 101, Amount: 50</div>
                    <div className="bg-background border border-border p-1 rounded">ID: 102, Amount: 75</div>
                 </div>
              </div>

              {/* Plus Sign */}
              <div className="flex justify-center"><Merge className="w-5 h-5 text-muted-foreground" /></div>

              {/* Middle: Manual Input */}
              <div className="flex items-center gap-3">
                 <FileInput className="w-8 h-8 text-primary" />
                 <div className="flex-1 bg-primary/10 border border-primary/20 rounded p-2 text-xs font-mono">
                    <span className="text-primary font-bold">report_date: '2023-10-27'</span>
                 </div>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" /></div>

              {/* Bottom: Result */}
              <div className="flex items-center gap-3">
                 <Database className="w-8 h-8 text-emerald-500" />
                 <div className="flex-1 bg-emerald-500/5 border border-emerald-500/20 rounded p-2 text-xs font-mono grid grid-cols-1 gap-2">
                    <div className="bg-background border border-emerald-100 dark:border-emerald-900 p-1 rounded flex justify-between">
                       <span>ID: 101, Amount: 50</span>
                       <span className="font-bold text-emerald-600 dark:text-emerald-400">2023-10-27</span>
                    </div>
                    <div className="bg-background border border-emerald-100 dark:border-emerald-900 p-1 rounded flex justify-between">
                       <span>ID: 102, Amount: 75</span>
                       <span className="font-bold text-emerald-600 dark:text-emerald-400">2023-10-27</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Configuration Schema */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileJson className="w-5 h-5" /></div>
          <h2 className="text-2xl font-bold">Dynamic Configuration</h2>
        </div>

        <div className="bg-zinc-950 rounded-xl p-6 shadow-2xl overflow-hidden border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-xs text-zinc-500 font-mono">resource_config.json</span>
            </div>
            <pre className="font-mono text-xs md:text-sm text-zinc-300 overflow-x-auto">
{`{
  "active": true,
  "category": "portal",
  "technical_name": "orders",
  "config": {
    "format": "excel",
    "manual_fields": [
      {
        "name": "Report Date",
        "target": "report_date",
        "type": "date",
        "required": true
      }
    ]
  }
}`}
            </pre>
        </div>
        <p className="text-sm text-muted-foreground">
            Resources are defined as JSON objects stored in the `meta` schema. This allows the application to support new report types and validation rules without requiring code changes or database migrations.
        </p>
      </section>

      {/* 6. How to Use */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><BookOpen className="w-5 h-5" /></div>
          <h2 className="text-2xl font-bold">Usage Workflow</h2>
        </div>

        <div className="space-y-4">
             {[
                 { title: "Define Source", desc: "Create a new Data Source (e.g., Trendyol) in the Configuration tab." },
                 { title: "Configure Resource", desc: "Define a specific report (e.g., Order List), its format, and any manual inputs required." },
                 { title: "Ingest Data", desc: "Navigate to Ingest Data, select your resource, and drag-and-drop the file." },
                 { title: "Preview & Commit", desc: "Verify the sanitized output in the preview modal, then click 'Confirm' to write to MotherDuck." }
             ].map((step, idx) => (
                 <div key={idx} className="flex gap-4">
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                        </div>
                        {idx !== 3 && <div className="w-0.5 bg-border h-full my-2"></div>}
                     </div>
                     <div className="pb-6">
                         <h4 className="font-bold text-lg">{step.title}</h4>
                         <p className="text-muted-foreground">{step.desc}</p>
                     </div>
                 </div>
             ))}
        </div>
      </section>

    </div>
  );
};

export default Documentation;
