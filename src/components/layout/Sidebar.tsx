import { useState } from 'react';
import { Upload, Moon, Sun, X, Menu } from 'lucide-react'; 
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {Dialog, DialogContent, DialogDescription, DialogFooter,DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useTheme } from '../theme-provider';
import type { SidebarState, ComparisonRun } from '../../types';
import { runNewComparison } from '../../api';
import './Sidebar.scss';

interface SidebarProps {
  state: SidebarState;
  onStateChange: (state: SidebarState) => void;
  allRuns: ComparisonRun[];
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Sidebar({
  state,
  onStateChange,
  isSidebarOpen, 
  setIsSidebarOpen, 
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gtZipFile, setGtZipFile] = useState<File | null>(null);
  const [outputZipFile, setOutputZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleRunComparison = async () => {
    if (!gtZipFile || !outputZipFile) return;

    setIsUploading(true);
    try {
      await runNewComparison(gtZipFile, outputZipFile);
      setIsDialogOpen(false);
      setGtZipFile(null);
      setOutputZipFile(null);
      window.location.reload();
    } catch (error) {
      console.error('Failed to run comparison:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {!isSidebarOpen && (
        <Button
          variant="secondary" 
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="sidebar-fixed-toggle"
          title="Show Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : 'is-closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">GT Comparison</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="theme-toggle"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close-toggle"
            title="Hide Sidebar"
          >
            <X className="h-5 w-5" />
          </Button>

        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="sidebar-content">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Start New Comparison
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload ZIP Files</DialogTitle>
                <DialogDescription>
                  Upload the Ground Truth and Output ZIP folders to run a new comparison.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="gt-zip">Ground Truth ZIP</Label>
                  <Input
                    id="gt-zip"
                    type="file"
                    accept=".zip"
                    onChange={(e) => setGtZipFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="output-zip">Output ZIP</Label>
                  <Input
                    id="output-zip"
                    type="file"
                    accept=".zip"
                    onChange={(e) => setOutputZipFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleRunComparison}
                  disabled={!gtZipFile || !outputZipFile || isUploading}
                >
                  {isUploading ? 'Running...' : 'Run Comparison'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Display Options</h3>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <Checkbox
                  id="final-summary"
                  checked={state.showFinalSummary}
                  onCheckedChange={(checked) =>
                    onStateChange({ ...state, showFinalSummary: !!checked })
                  }
                />
                <Label htmlFor="final-summary">Superscript Summary Result</Label>
              </div>
              <div className="checkbox-item">
                <Checkbox
                  id="indentation-result"
                  checked={state.showIndentationResult}
                  onCheckedChange={(checked) =>
                    onStateChange({ ...state, showIndentationResult: !!checked })
                  }
                />
                <Label htmlFor="indentation-result">Indentation Result</Label>
              </div>
              <div className="checkbox-item">
                <Checkbox
                  id="run-summary"
                  checked={state.showRunSummary}
                  onCheckedChange={(checked) =>
                    onStateChange({ ...state, showRunSummary: !!checked })
                  }
                />
                <Label htmlFor="run-summary">Show Run Summary</Label>
              </div>
              <div className="checkbox-item">
                <Checkbox
                  id="file-diff"
                  checked={state.showFileDiff}
                  onCheckedChange={(checked) =>
                    onStateChange({ ...state, showFileDiff: !!checked })
                  }
                />
                <Label htmlFor="file-diff">Show Individual File Results</Label>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
