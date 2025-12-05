
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, X, Loader2, Database, AlertTriangle, ChevronDown, ChevronRight, Settings, FileJson, PenTool, ArrowLeft, FileType, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api, sanitizeHeader, EMPTY_CONFIG } from '../services/api';
import { Source, Resource, ResourceConfig, ManualField, FileFormat } from '../types';

// Updated Category Options with styles
const CATEGORY_BUTTONS = [
  { 
    id: 'portal', 
    label: 'Portal', 
    baseStyle: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-500/20',
    activeStyle: 'bg-orange-500 text-white border-orange-600 ring-2 ring-orange-500 ring-offset-2 ring-offset-background shadow-md'
  },
  { 
    id: 'api', 
    label: 'API', 
    baseStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-500/20',
    activeStyle: 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-500 ring-offset-2 ring-offset-background shadow-md'
  },
  { 
    id: 'other', 
    label: 'Other', 
    baseStyle: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-500/20',
    activeStyle: 'bg-slate-500 text-white border-slate-600 ring-2 ring-slate-500 ring-offset-2 ring-offset-background shadow-md'
  }
];

const FORMAT_OPTIONS: { id: FileFormat; label: string }[] = [
  { id: 'excel', label: 'Excel (.xlsx)' },
  { id: 'csv', label: 'CSV (.csv)' },
  { id: 'html', label: 'HTML Table' },
  { id: 'json', label: 'JSON' },
  { id: 'parquet', label: 'Parquet' },
];

const TYPE_OPTIONS = ['text', 'integer', 'decimal', 'date', 'boolean'];

const ConfigManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'sources' | 'infrastructure'>('resources');
  
  // Responsive State
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Resources State
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [collapsedSourceIds, setCollapsedSourceIds] = useState<Set<string>>(new Set());

  // Editor State
  const [editorTab, setEditorTab] = useState<'general' | 'manual' | 'json'>('general');
  const [resourceForm, setResourceForm] = useState<Partial<Resource>>({});
  const [configForm, setConfigForm] = useState<ResourceConfig>(EMPTY_CONFIG);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');

  // Sources State
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [sourceFormData, setSourceFormData] = useState<Partial<Source>>({ display_name: '', technical_name: '', logo_color: 'bg-slate-500' });

  // Infrastructure State
  const [mdConfig, setMdConfig] = useState({ dbName: 'akd_nexus', token: '' });
  const [showToken, setShowToken] = useState(false);
  const [isSavingInfra, setIsSavingInfra] = useState(false);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => void;
    variant: 'destructive' | 'default';
  }>({ isOpen: false, title: '', message: '', actionLabel: 'Confirm', onConfirm: () => {}, variant: 'default' });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSources(true);
      const sourcesData = await api.getSources();
      setSources(sourcesData);
      
      if (activeTab === 'resources') {
        setLoadingResources(true);
        const allResources: Resource[] = [];
        for (const src of sourcesData) {
          const res = await api.getResources(src.id);
          allResources.push(...res);
        }
        setResources(allResources);
        setLoadingResources(false);
      }
      setLoadingSources(false);
    };
    fetchData();
  }, [activeTab]);

  const initResourceEditor = (res: Resource | null) => {
    if (res) {
      setSelectedResource(res);
      setResourceForm({ ...res });
      setConfigForm({ ...res.config });
      setJsonText(JSON.stringify(res.config, null, 2));
      setIsCreatingResource(false);
    } else {
      setSelectedResource(null);
      setResourceForm({ active: true, category: 'portal', display_name: '', technical_name: '', source_id: sources[0]?.id || '' });
      setConfigForm(EMPTY_CONFIG);
      setJsonText(JSON.stringify(EMPTY_CONFIG, null, 2));
      setIsCreatingResource(true);
    }
    setEditorTab('general');
    setJsonError(null);
    setMobileView('detail'); // Switch to detail view on mobile
  };

  const handleFormChange = (field: keyof Resource, value: any) => {
    setResourceForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'display_name' && isCreatingResource) {
        updated.technical_name = sanitizeHeader(value as string);
      }
      return updated;
    });
  };

  const handleConfigChange = (newConfig: ResourceConfig) => {
    setConfigForm(newConfig);
    setJsonText(JSON.stringify(newConfig, null, 2));
  };

  const handleSaveResource = () => {
    const newResource: Resource = {
      id: isCreatingResource ? `res-${Date.now()}` : selectedResource!.id,
      source_id: resourceForm.source_id!,
      display_name: resourceForm.display_name!,
      technical_name: resourceForm.technical_name!,
      category: resourceForm.category || 'other',
      active: resourceForm.active ?? true,
      config: configForm
    };
    if (isCreatingResource) {
      setResources(prev => [...prev, newResource]);
      setIsCreatingResource(false);
      setSelectedResource(newResource);
    } else {
      setResources(prev => prev.map(r => r.id === newResource.id ? newResource : r));
      setSelectedResource(newResource);
    }
    setMobileView('list');
  };

  const handleDeleteResourceRequest = () => {
    if (!selectedResource) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Resource?',
      message: `Are you sure you want to delete "${selectedResource.display_name}"? This action cannot be undone.`,
      actionLabel: 'Delete',
      variant: 'destructive',
      onConfirm: () => {
        setResources(prev => prev.filter(r => r.id !== selectedResource.id));
        setSelectedResource(null);
        setMobileView('list');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toggleSource = (id: string) => {
    const newSet = new Set(collapsedSourceIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setCollapsedSourceIds(newSet);
  };

  const updateManualField = (index: number, field: keyof ManualField, value: any) => {
    const updatedFields = [...configForm.manual_fields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    if (field === 'name') updatedFields[index].target = sanitizeHeader(value as string);
    handleConfigChange({ ...configForm, manual_fields: updatedFields });
  };

  const handleDeleteFieldRequest = (index: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Field?',
      message: 'Are you sure you want to remove this manual input field? Data associated with this field in future uploads will not be captured.',
      actionLabel: 'Remove',
      variant: 'destructive',
      onConfirm: () => {
        const updatedFields = configForm.manual_fields.filter((_, i) => i !== index);
        handleConfigChange({ ...configForm, manual_fields: updatedFields });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveInfra = () => {
    setIsSavingInfra(true);
    // Simulate API call
    setTimeout(() => {
        setIsSavingInfra(false);
    }, 1000);
  };

  const currentSource = sources.find(s => s.id === resourceForm.source_id);
  const previewTableName = `${currentSource?.technical_name || 'source'}.${(resourceForm.category || 'category').toLowerCase()}_${(resourceForm.technical_name || 'name').toLowerCase()}`;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-background max-w-7xl mx-auto">
      {/* Mobile Back Header */}
      {mobileView === 'detail' && (
        <div className="md:hidden flex items-center p-4 border-b border-border bg-background">
          <button onClick={() => setMobileView('list')} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
          </button>
        </div>
      )}

      {/* Main Tabs */}
      {mobileView === 'list' && (
         <div className="border-b border-border mb-4 shrink-0 flex items-center justify-between">
           <nav className="flex space-x-6 px-1">
             <button onClick={() => setActiveTab('resources')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'resources' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>Resources</button>
             <button onClick={() => setActiveTab('sources')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sources' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>Data Sources</button>
             <button onClick={() => setActiveTab('infrastructure')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'infrastructure' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>Infrastructure</button>
           </nav>
         </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm flex-1 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* --- LEFT SIDEBAR (List) --- */}
        {activeTab === 'resources' && (
          <div className={`w-full md:w-80 border-r border-border bg-muted/20 flex flex-col h-full overflow-hidden ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">All Resources</span>
              <button onClick={() => initResourceEditor(null)} className="bg-primary text-primary-foreground p-1.5 rounded-md hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingResources ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="divide-y divide-border">
                  {sources.map((source) => {
                    const srcResources = resources.filter(r => r.source_id === source.id);
                    const isCollapsed = collapsedSourceIds.has(source.id);
                    return (
                      <div key={source.id} className="bg-card">
                         <button onClick={() => toggleSource(source.id)} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50">
                           <div className="flex items-center gap-2">
                              {isCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                              <span className="font-medium text-sm">{source.display_name}</span>
                           </div>
                           <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{srcResources.length}</span>
                         </button>
                         {!isCollapsed && (
                           <div className="pl-4">
                              {srcResources.map(res => (
                                <div key={res.id} 
                                     onClick={() => initResourceEditor(res)}
                                     className={`pl-8 pr-4 py-3 cursor-pointer text-sm border-l-2 transition-colors flex items-center justify-between ${
                                       selectedResource?.id === res.id && !isCreatingResource 
                                        ? 'border-primary bg-accent text-accent-foreground' 
                                        : 'border-transparent hover:bg-muted/50 text-muted-foreground'
                                     }`}
                                >
                                  <span className="truncate">{res.display_name}</span>
                                  <div className={`w-2 h-2 rounded-full ${res.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- RIGHT PANEL (Editor) --- */}
        {activeTab === 'resources' && (
          <div className={`flex-1 bg-card flex flex-col h-full overflow-hidden ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {(selectedResource || isCreatingResource) ? (
              <>
                <div className="px-8 pt-8 pb-0 shrink-0">
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-4">
                      {/* Breadcrumbs */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{currentSource?.display_name}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>{resourceForm.display_name || 'New Resource'}</span>
                      </div>
                      
                      {/* Title & Preview Pill */}
                      <div className="space-y-3">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground">{resourceForm.display_name || 'Untitled Resource'}</h3>
                        <div className="inline-flex items-center px-3 py-1 rounded bg-muted/50 border border-border text-muted-foreground text-xs font-mono select-all">
                           {previewTableName}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                       {!isCreatingResource && (
                         <button 
                           onClick={handleDeleteResourceRequest}
                           className="text-muted-foreground hover:text-destructive transition-colors p-2"
                           title="Delete Resource"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       )}
                       <button 
                        onClick={handleSaveResource} 
                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm"
                       >
                         <Save className="w-4 h-4" /> Save
                       </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-6 border-b border-border mt-8">
                    {[
                      { id: 'general', label: 'General', icon: Settings },
                      { id: 'manual', label: 'Inputs', icon: PenTool },
                      { id: 'json', label: 'JSON', icon: FileJson },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setEditorTab(tab.id as any)}
                        className={`pb-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-all ${
                          editorTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                   {editorTab === 'general' && (
                     <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Display Name</label>
                            <input 
                              type="text" 
                              value={resourceForm.display_name} 
                              onChange={e => handleFormChange('display_name', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                              placeholder="e.g. Order List"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Category</label>
                            <div className="flex items-center gap-3">
                              {CATEGORY_BUTTONS.map(btn => {
                                const isSelected = resourceForm.category === btn.id;
                                return (
                                  <button
                                    key={btn.id}
                                    onClick={() => handleFormChange('category', btn.id)}
                                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-all ${
                                      isSelected 
                                        ? btn.activeStyle 
                                        : `${btn.baseStyle} hover:opacity-100 opacity-80`
                                    }`}
                                  >
                                    {btn.label}
                                  </button>
                                )
                              })}
                            </div>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Technical Name</label>
                          <input 
                            type="text" 
                            value={resourceForm.technical_name}
                            onChange={e => handleFormChange('technical_name', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="e.g. orders"
                          />
                       </div>

                       <div className="space-y-3 pt-2">
                          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                             File Format
                             <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">Required</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                             {FORMAT_OPTIONS.map((fmt) => (
                               <label key={fmt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${configForm.format === fmt.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:bg-muted/50'}`}>
                                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${configForm.format === fmt.id ? 'border-primary' : 'border-muted-foreground'}`}>
                                   {configForm.format === fmt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                 </div>
                                 <input 
                                   type="radio" 
                                   name="format" 
                                   value={fmt.id} 
                                   checked={configForm.format === fmt.id}
                                   onChange={() => handleConfigChange({ ...configForm, format: fmt.id })}
                                   className="hidden"
                                 />
                                 <div className="flex items-center gap-2">
                                    <FileType className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{fmt.label}</span>
                                 </div>
                               </label>
                             ))}
                          </div>
                       </div>

                       <div className="pt-6">
                         <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-foreground">Active Status</label>
                            <button 
                               onClick={() => handleFormChange('active', !resourceForm.active)}
                               className={`w-11 h-6 rounded-full relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${resourceForm.active ? 'bg-primary' : 'bg-input'}`}
                            >
                               <span className={`absolute top-0.5 left-0.5 bg-background w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${resourceForm.active ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                         </div>
                       </div>
                     </div>
                   )}

                   {editorTab === 'manual' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-foreground">Manual Input Fields</h4>
                            <p className="text-sm text-muted-foreground">Define fields that must be manually entered during upload.</p>
                          </div>
                          <button onClick={() => {
                              const newField: ManualField = { name: '', target: '', required: true, type: 'text' };
                              handleConfigChange({ ...configForm, manual_fields: [...configForm.manual_fields, newField] });
                          }} className="text-xs bg-primary text-primary-foreground hover:opacity-90 px-3 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
                             <Plus className="w-3.5 h-3.5" /> Add Field
                          </button>
                       </div>
                       
                       <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                                <tr>
                                  <th className="px-4 py-3 text-left font-medium w-1/3">Label</th>
                                  <th className="px-4 py-3 text-left font-medium w-1/3">Target Column</th>
                                  <th className="px-4 py-3 text-left font-medium">Type</th>
                                  <th className="px-4 py-3 text-center font-medium">Required</th>
                                  <th className="w-12"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {configForm.manual_fields.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                                      No manual fields defined.
                                    </td>
                                  </tr>
                                )}
                                {configForm.manual_fields.map((field, idx) => (
                                  <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-2">
                                      <input 
                                        value={field.name} 
                                        onChange={e => updateManualField(idx, 'name', e.target.value)} 
                                        className="bg-transparent w-full outline-none py-1 border-b border-transparent focus:border-primary transition-colors placeholder:text-muted-foreground/50" 
                                        placeholder="Display Name"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input 
                                        value={field.target} 
                                        onChange={e => updateManualField(idx, 'target', e.target.value)} 
                                        className="bg-transparent w-full outline-none font-mono text-xs text-muted-foreground py-1 border-b border-transparent focus:border-primary transition-colors" 
                                        placeholder="target_column"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                       <select 
                                        value={field.type} 
                                        onChange={e => updateManualField(idx, 'type', e.target.value)} 
                                        className="bg-transparent outline-none py-1 cursor-pointer text-muted-foreground focus:text-foreground"
                                      >
                                          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                       </select>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={field.required} 
                                        onChange={e => updateManualField(idx, 'required', e.target.checked)}
                                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <button 
                                        onClick={() => handleDeleteFieldRequest(idx)} 
                                        className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove Field"
                                      >
                                        <Trash2 className="w-4 h-4"/>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                         </div>
                       </div>
                     </div>
                   )}

                   {editorTab === 'json' && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
                        <textarea 
                          value={jsonText} 
                          onChange={e => { setJsonText(e.target.value); try { setConfigForm(JSON.parse(e.target.value)); setJsonError(null); } catch(err: any) { setJsonError(err.message); } }}
                          className="flex-1 w-full font-mono text-xs bg-card p-6 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
                          spellCheck={false}
                        />
                        {jsonError && (
                          <div className="mt-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
                            <AlertTriangle className="w-4 h-4" />
                            {jsonError}
                          </div>
                        )}
                      </div>
                   )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No Resource Selected</h3>
                <p className="max-w-xs text-center mt-2">Select a resource from the sidebar to view or edit its configuration.</p>
              </div>
            )}
          </div>
        )}

        {/* --- SOURCES TAB --- */}
        {activeTab === 'sources' && (
          <div className="w-full p-8 overflow-y-auto bg-background/50">
             <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="font-bold text-2xl tracking-tight">Data Sources</h3>
                  <p className="text-muted-foreground">Manage the source systems connected to the ETL pipeline.</p>
               </div>
               <button onClick={() => { setEditingSource(null); setSourceFormData({}); setIsSourceModalOpen(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                  Add Source
               </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sources.map(s => (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm ${s.logo_color || 'bg-muted'}`}>
                          {s.display_name[0]}
                        </div>
                        <button onClick={() => { setEditingSource(s); setSourceFormData(s); setIsSourceModalOpen(true); }} className="text-muted-foreground hover:text-primary p-2 hover:bg-accent rounded-md transition-colors opacity-0 group-hover:opacity-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                     </div>
                     <h4 className="font-bold text-lg">{s.display_name}</h4>
                     <p className="text-xs text-muted-foreground font-mono mt-1 mb-4">{s.technical_name}</p>
                     
                     <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                        <Database className="w-3 h-3" />
                        <span>Connected</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* --- INFRASTRUCTURE TAB --- */}
        {activeTab === 'infrastructure' && (
          <div className="w-full p-8 overflow-y-auto bg-background/50 flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <div className="mb-8">
                <h3 className="font-bold text-2xl tracking-tight">MotherDuck Infrastructure</h3>
                <p className="text-muted-foreground">Configure the connection to your cloud data warehouse.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">Secure Connection Active</h4>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">Credentials are encrypted at rest.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Database Name</label>
                    <div className="relative">
                      <Database className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        value={mdConfig.dbName}
                        onChange={(e) => setMdConfig({...mdConfig, dbName: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="e.g. akd_nexus"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Service Token</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input 
                        type={showToken ? "text" : "password"} 
                        value={mdConfig.token}
                        onChange={(e) => setMdConfig({...mdConfig, token: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                        placeholder="md_..."
                      />
                      <button 
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Paste your MotherDuck service token here. It usually starts with 'md_'.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end gap-3">
                   <button 
                     onClick={handleSaveInfra}
                     disabled={isSavingInfra}
                     className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-70"
                   >
                     {isSavingInfra ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     {isSavingInfra ? 'Saving...' : 'Save Configuration'}
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simple Modal for Source Edit */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl p-6 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold">{editingSource ? 'Edit Source' : 'New Source'}</h3>
               <button onClick={() => setIsSourceModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
             </div>
             
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Display Name</label>
                 <input 
                    type="text" 
                    placeholder="e.g. Trendyol" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" 
                    value={sourceFormData.display_name || ''} 
                    onChange={e => setSourceFormData({...sourceFormData, display_name: e.target.value})} 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Technical Name</label>
                 <input 
                    type="text" 
                    placeholder="e.g. trendyol" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" 
                    value={sourceFormData.technical_name || ''} 
                    onChange={e => setSourceFormData({...sourceFormData, technical_name: e.target.value})} 
                 />
               </div>
             </div>
             
             <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => setIsSourceModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">Cancel</button>
               <button onClick={() => { /* Mock save */ setIsSourceModalOpen(false); }} className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-md hover:opacity-90 transition-opacity">Save Changes</button>
             </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl p-6 animate-in zoom-in-95 duration-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold tracking-tight">{confirmDialog.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{confirmDialog.message}</p>
              </div>
              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
                   className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmDialog.onConfirm} 
                   className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-opacity hover:opacity-90 ${confirmDialog.variant === 'destructive' ? 'bg-destructive' : 'bg-primary'}`}
                 >
                   {confirmDialog.actionLabel}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ConfigManager;
