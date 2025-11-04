import { useState } from 'react';
import { Upload, Moon, Sun, X, Menu } from 'lucide-react'; 
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {Dialog, DialogContent, DialogDescription, DialogFooter,DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useTheme } from '../theme-provider';
import type { SidebarState, ComparisonRun, FileResult } from '../../types';
import { runNewComparison } from '../../api';
import './Sidebar.scss';

interface SidebarProps {
  state: SidebarState;
  onStateChange: (state: SidebarState) => void;
  allRuns: ComparisonRun[];
  fileResults: FileResult[];
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Sidebar({
  state,
  onStateChange,
  allRuns,
  fileResults,
  isSidebarOpen, 
  setIsSidebarOpen, 
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [gtZipFile, setGtZipFile] = useState<File | null>(null);
  const [outputZipFile, setOutputZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uniqueFileNames = Array.from(
    new Set(fileResults.map((f) => f.file_name))
  ).sort();

  const fileSuffixes = state.selectedFileName
    ? Array.from(
      new Set(
        fileResults
          .filter((f) => f.file_name === state.selectedFileName)
          .map((f) => f.page_num.toString())
      )
    ).sort()
    : [];

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

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Column Selection</h3>
            <RadioGroup
              value={state.columnToggle}
              onValueChange={(value) =>
                onStateChange({ ...state, columnToggle: value as any })
              }
            >
              <div className="radio-item">
                <RadioGroupItem value="all" id="all-columns" />
                <Label htmlFor="all-columns">All Columns</Label>
              </div>
              <div className="radio-item">
                <RadioGroupItem value="superscript" id="superscript-columns" />
                <Label htmlFor="superscript-columns">Superscript Results</Label>
              </div>
              <div className="radio-item">
                <RadioGroupItem value="font_info" id="font-info-columns" />
                <Label htmlFor="font-info-columns">Font Info Results</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Data Selection</h3>
            <div className="dropdown-group">
              <Label>Select Result Folder (Run)</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {state.selectedRunId || 'Select Run...'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allRuns.map((run) => (
                    <DropdownMenuItem
                      key={run.id}
                      onClick={() =>
                        onStateChange({
                          ...state,
                          selectedRunId: run.id,
                          selectedFileName: null,
                          selectedFileSuffix: null,
                        })
                      }
                    >
                      {run.Date_Time}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {state.selectedRunId && (
              <div className="dropdown-group">
                <Label>File Name</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {state.selectedFileName || 'Select File...'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {uniqueFileNames.map((fileName) => (
                      <DropdownMenuItem
                        key={fileName}
                        onClick={() =>
                          onStateChange({
                            ...state,
                            selectedFileName: fileName,
                            selectedFileSuffix: null,
                          })
                        }
                      >
                        {fileName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {state.selectedFileName && (
              <div className="dropdown-group">
                <Label>File Suffix</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {state.selectedFileSuffix || 'Select Suffix...'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {fileSuffixes.map((suffix) => (
                      <DropdownMenuItem
                        key={suffix}
                        onClick={() =>
                          onStateChange({ ...state, selectedFileSuffix: suffix })
                        }
                      >
                        Page {suffix}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
