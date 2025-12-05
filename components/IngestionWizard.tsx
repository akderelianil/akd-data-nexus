
import React, { useState, useEffect, useMemo } from 'react';
import { Upload, FileText, Check, ChevronRight, Search, Database, AlertCircle, X, Loader2, Play, FileSpreadsheet, Calendar, Hash, Type } from 'lucide-react';
import { api } from '../services/api';
import { Source, Resource, IngestState, ManualField } from '../types';

const IngestionWizard: React.FC = () => {
  // --- Global State ---
  const [sources, setSources] = useState<Source[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  
  const [data, setData] = useState<IngestState>({
    sourceId: null,
    resourceId: null,
    file: null,
    previewData: null,
    uploadProgress: 0,
    manualValues: {}
  });

  // --- UI State ---
  const [resourceSearch, setResourceSearch] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load Sources on Mount
  useEffect(() => {
    api.getSources().then(setSources);
  }, []);

  // Load Resources when Source Changes
  useEffect(() => {
    if (data.sourceId) {
      setResources([]); // Clear old
      api.getResources(data.sourceId).then(setResources);
    } else {
      setResources([]);
    }
  }, [data.sourceId]);

  const updateData = (updates: Partial<IngestState>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateData({ file: e.target.files[0], previewData: null });
      setIngestionStatus('idle');
    }
  };

  const selectedSource = sources.find(s => s.id === data.sourceId);
  const selectedResource = resources.find(r => r.id === data.resourceId);
  const filteredResources = resources.filter(r => 
    r.display_name.toLowerCase().includes(resourceSearch.toLowerCase()) || 
    r.technical_name.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const getAcceptAttribute = (format?: string) => {
    switch(format) {
      case 'excel': return '.xlsx, .xls';
      case 'csv': return '.csv';
      case 'html': return '.html, .htm';
      case 'json': return '.json';
      case 'parquet': return '.parquet';
      default: return '.csv, .xlsx';
    }
  };

  const handlePreview = async () => {
    if (!data.file) return;
    setIsPreviewOpen(true);
    if (!data.previewData) {
      const preview = await api.uploadPreview(data.file);
      updateData({ previewData: preview });
    }
  };

  const handleIngest = async () => {
    if (!data.resourceId || !data.file) return;
    setIsIngesting(true);
    
    // Simulate progress
    for (let i = 0; i <= 90; i += 10) {
      updateData({ uploadProgress: i });
      await new Promise(r => setTimeout(r, 200));
    }

    try {
      await api.ingestFile(data.resourceId, data.file);
      updateData({ uploadProgress: 100 });
      setIngestionStatus('success');
      setTimeout(() => setIsPreviewOpen(false), 1500); // Close modal after success
      
      // Reset after success
      setTimeout(() => {
        setData({
            sourceId: null,
            resourceId: null,
            file: null,
            previewData: null,
            uploadProgress: 0,
            manualValues: {}
        });
        setIngestionStatus('idle');
        setIsIngesting(false);
      }, 2000);

    } catch (e) {
      setIngestionStatus('error');
      setIsIngesting(false);
    }
  };

  const isFormValid = data.sourceId && data.resourceId && data.file;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
      
      {/* --- LEFT PANEL: File Upload Context --- */}
      <div className={`lg:w-5/12 p-8 flex flex-col transition-colors duration-300 relative overflow-hidden ${data.file ? 'bg-primary/5 dark:bg-primary/10' : 'bg-muted/30'}`}>
        <div className="z-10 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Data Ingestion</h2>
          <p className="text-muted-foreground mb-8">Upload reports to the Bronze Layer.</p>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className={`border-2 border-dashed rounded-2xl transition-all duration-300 relative group flex flex-col items-center justify-center p-10 text-center
              ${data.file 
                ? 'border-primary bg-background shadow-lg scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'}`}
            >
              <input 
                type="file" 
                accept={getAcceptAttribute(selectedResource?.config?.format)}
                onChange={handleFileChange}
                disabled={!selectedResource}
                title={!selectedResource ? 'Select a resource first' : 'Upload file'}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
              />
              
              {data.file ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-lg truncate max-w-[250px]">{data.file.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{(data.file.size / 1024).toFixed(1)} KB</p>
                  <div className="mt-4 inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    <Check className="w-3 h-3 mr-1" /> Ready for config
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Click to replace file</p>
                </div>
              ) : (
                <>
                  <div className={`w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 transition-transform ${selectedResource ? 'group-hover:scale-110' : 'opacity-50'}`}>
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg">{selectedResource ? 'Drop your file here' : 'Select Resource First'}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                    {selectedResource 
                      ? `Supports ${getAcceptAttribute(selectedResource.config.format)} files.`
                      : 'Choose a source and resource on the right to enable upload.'}
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground/60 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><Database className="w-3 h-3"/> MotherDuck Connected</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3"/> Auto-Sanitization Active</span>
          </div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* --- RIGHT PANEL: Configuration Flow --- */}
      <div className="lg:w-7/12 bg-background flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Section 1: Source */}
          <section className="animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
             <div className="flex items-center gap-3 mb-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${data.sourceId ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>1</div>
               <h3 className="font-semibold text-lg">Select Source</h3>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-11">
               {sources.map(source => (
                 <button
                   key={source.id}
                   onClick={() => updateData({ sourceId: source.id, resourceId: null, manualValues: {} })}
                   className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                     data.sourceId === source.id 
                       ? 'border-primary ring-1 ring-primary bg-primary/5' 
                       : 'border-border bg-card hover:bg-accent/50'
                   }`}
                 >
                   <div className={`w-8 h-8 rounded-lg ${source.logo_color || 'bg-slate-500'} flex items-center justify-center text-white text-xs font-bold mb-3 shadow-sm`}>
                     {source.display_name[0]}
                   </div>
                   <div className="font-medium text-sm">{source.display_name}</div>
                 </button>
               ))}
             </div>
          </section>

          {/* Section 2: Resource */}
          <section className={`transition-opacity duration-300 ${!data.sourceId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
             <div className="flex items-center gap-3 mb-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${data.resourceId ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>2</div>
               <h3 className="font-semibold text-lg">Select Resource</h3>
             </div>

             <div className="pl-11">
               <div className="relative mb-3">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                 <input 
                   type="text" 
                   placeholder="Search reports..." 
                   value={resourceSearch}
                   onChange={(e) => setResourceSearch(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                 />
               </div>
               
               <div className="max-h-[200px] overflow-y-auto space-y-2 border border-border rounded-lg p-2 bg-card/50">
                 {filteredResources.length > 0 ? filteredResources.map(res => (
                   <button
                     key={res.id}
                     onClick={() => updateData({ resourceId: res.id, manualValues: {} })}
                     className={`w-full flex items-center justify-between p-3 rounded-md text-sm transition-colors ${
                       data.resourceId === res.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'
                     }`}
                   >
                     <span>{res.display_name}</span>
                     {data.resourceId === res.id && <Check className="w-4 h-4" />}
                   </button>
                 )) : (
                   <div className="text-center py-8 text-muted-foreground text-sm">
                     {data.sourceId ? 'No resources found.' : 'Select a source first.'}
                   </div>
                 )}
               </div>
             </div>
          </section>

          {/* Section 3: Manual Inputs */}
          <section className={`transition-opacity duration-300 ${!data.resourceId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${selectedResource?.config.manual_fields.length ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>3</div>
               <h3 className="font-semibold text-lg">Data Entry</h3>
            </div>

            <div className="pl-11 space-y-4">
              {selectedResource?.config.manual_fields.length ? (
                selectedResource.config.manual_fields.map((field, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-2">
                      {getFieldIcon(field.type)}
                      {field.name} {field.required && <span className="text-destructive">*</span>}
                    </label>
                    <input 
                      type={field.type === 'date' ? 'date' : field.type === 'integer' || field.type === 'decimal' ? 'number' : 'text'}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      onChange={(e) => updateData({ 
                        manualValues: { ...data.manualValues, [field.target]: e.target.value } 
                      })}
                      value={data.manualValues[field.target] || ''}
                    />
                  </div>
                ))
              ) : (
                 <div className="text-sm text-muted-foreground italic border border-dashed border-border p-4 rounded-lg bg-muted/20">
                    No manual inputs required for this resource.
                 </div>
              )}
            </div>
          </section>

          {/* Spacer for bottom bar */}
          <div className="h-20"></div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-between">
           <div className="text-sm text-muted-foreground hidden sm:block">
             {selectedResource ? (
               <span>Target: <span className="font-mono text-xs bg-muted px-1 rounded text-foreground">{selectedResource.technical_name}</span></span>
             ) : (
               <span>Complete steps to proceed</span>
             )}
           </div>
           
           <button 
             onClick={handlePreview}
             disabled={!isFormValid}
             className="ml-auto sm:ml-0 flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
           >
             Preview & Ingest <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* --- PREVIEW MODAL --- */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Verify Data</h3>
                <p className="text-sm text-muted-foreground">Review the sanitized output before writing to the database.</p>
              </div>
              {!isIngesting && (
                <button onClick={() => setIsPreviewOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-0 relative">
               {isIngesting ? (
                 <div className="flex flex-col items-center justify-center h-[300px] gap-6">
                    {ingestionStatus === 'success' ? (
                       <div className="flex flex-col items-center animate-in zoom-in duration-300">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-500/20">
                            <Check className="w-10 h-10" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">Ingestion Complete!</h3>
                          <p className="text-muted-foreground">Redirecting...</p>
                       </div>
                    ) : (
                       <div className="w-full max-w-md space-y-6 text-center">
                          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                          <div>
                            <h3 className="text-lg font-semibold">Processing Data...</h3>
                            <p className="text-sm text-muted-foreground">{data.uploadProgress}% Complete</p>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                             <div 
                               className="bg-primary h-full transition-all duration-300 ease-out" 
                               style={{ width: `${data.uploadProgress}%` }}
                             />
                          </div>
                       </div>
                    )}
                 </div>
               ) : (
                 <div className="p-6">
                   {/* Manual Fields Summary */}
                   {Object.keys(data.manualValues).length > 0 && (
                     <div className="mb-6 bg-accent/30 rounded-lg p-4 border border-border">
                       <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Manual Inputs</h4>
                       <div className="flex flex-wrap gap-4">
                         {Object.entries(data.manualValues).map(([key, val]) => (
                           <div key={key} className="text-sm">
                             <span className="font-mono text-muted-foreground">{key}:</span> <span className="font-medium">{val as string}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Data Table */}
                   <div className="rounded-lg border border-border overflow-hidden">
                      {data.previewData ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground">
                              <tr>
                                {Object.keys(data.previewData[0]).map((h, i) => (
                                  <th key={i} className="px-6 py-3 font-mono text-xs whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                              {data.previewData.map((row: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/50">
                                  {Object.keys(row).map((h, j) => (
                                    <td key={`${i}-${j}`} className="px-6 py-3 whitespace-nowrap">{row[h]}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 flex justify-center text-muted-foreground">
                           <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading preview...
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500">
                     <AlertCircle className="w-4 h-4" />
                     <span>This is a sample of the first 5 rows. Data will be cast to VARCHAR in the Bronze layer.</span>
                   </div>
                 </div>
               )}
            </div>

            {/* Modal Footer */}
            {!isIngesting && (
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="px-4 py-2 rounded-lg font-medium text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleIngest} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
                >
                  Confirm Upload <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for Icons
const getFieldIcon = (type: string) => {
  switch (type) {
    case 'date': return <Calendar className="w-3.5 h-3.5 text-muted-foreground" />;
    case 'integer': 
    case 'decimal': return <Hash className="w-3.5 h-3.5 text-muted-foreground" />;
    default: return <Type className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

export default IngestionWizard;
