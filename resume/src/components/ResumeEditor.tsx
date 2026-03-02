"use client";

import { AlertCircle, Save, X } from "lucide-react";
import { useState } from "react";

interface ResumeEditorProps {
  initialData: any;
  onSave: (newData: any) => Promise<void>;
  onClose: () => void;
}

export default function ResumeEditor({ initialData, onSave, onClose }: ResumeEditorProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(initialData, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsed = JSON.parse(jsonText);
      await onSave(parsed);
      onClose();
    } catch (err: any) {
      setError(err instanceof SyntaxError ? "Invalid JSON format: " + err.message : (err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-card border border-border w-full max-w-4xl h-[80vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-border flex items-center justify-between font-sans">
          <h2 className="text-xl font-black text-foreground">Edit Resume Content (JSON)</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors font-sans">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-hidden">
          <textarea
            className="w-full h-full bg-muted font-mono text-sm p-4 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none scrollbar-hide"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste your resume JSON here..."
          />
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-500/10 text-red-600 flex items-center gap-3 text-sm font-sans">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 border-t border-border flex justify-end gap-4 font-sans">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-all font-sans"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 font-sans"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
