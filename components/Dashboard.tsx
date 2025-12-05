import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle, XCircle, FileSpreadsheet, HardDrive, Clock, Activity, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { IngestionLog } from '../types';

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getRecentLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          title="Total Rows Ingested" 
          value="2,405,102" 
          change="+12% this month"
          icon={HardDrive}
        />
        <Card 
          title="Active Resources" 
          value="14" 
          change="Across 4 Sources"
          icon={FileSpreadsheet}
          trend="neutral"
        />
        <Card 
          title="Success Rate" 
          value="98.5%" 
          change="Last 30 days"
          icon={Activity}
          trend="positive"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Real-time ingestion logs from all sources.</p>
          </div>
          <button className="text-sm font-medium hover:underline">View All</button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading activity...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-3 whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 whitespace-nowrap">Source & Resource</th>
                  <th className="px-6 py-3 whitespace-nowrap">File Name</th>
                  <th className="px-6 py-3 whitespace-nowrap">Row Count</th>
                  <th className="px-6 py-3 whitespace-nowrap">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.source_name}</span>
                        <span className="text-xs text-muted-foreground">{log.resource_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs whitespace-nowrap">{log.file_name}</td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{log.row_count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(log.ingested_at).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(log.ingested_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; value: string; change: string; icon: any; trend?: 'positive' | 'neutral' | 'negative' }> = ({ title, value, change, icon: Icon, trend = 'positive' }) => (
  <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <h3 className="text-2xl font-bold tracking-tight mb-1">{value}</h3>
    <p className={`text-xs font-medium flex items-center gap-1 ${trend === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
      {trend === 'positive' && <ArrowUpRight className="w-3 h-3" />}
      {change}
    </p>
  </div>
);

export default Dashboard;