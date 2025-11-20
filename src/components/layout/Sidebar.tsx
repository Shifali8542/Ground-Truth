import { useState } from 'react';
import { Upload, Moon, Sun, X, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useTheme } from '../theme-provider';
import type { SidebarState, ComparisonRun } from '../../types';
import { runNewComparison, fetchUnprocessedGTFolders, fetchUnprocessedOutputFolders, runS3Comparison } from '../../api';
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
  const [isLocalUploadDialogOpen, setIsLocalUploadDialogOpen] = useState(false);
  const [isS3DialogOpen, setIsS3DialogOpen] = useState(false);
  const [gtZipFile, setGtZipFile] = useState<File | null>(null);
  const [outputZipFile, setOutputZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gtFolders, setGtFolders] = useState<string[]>([]);
  const [outputFolders, setOutputFolders] = useState<string[]>([]);
  const [selectedGtFolder, setSelectedGtFolder] = useState<string | null>(null);
  const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null);
  const [isS3Comparing, setIsS3Comparing] = useState(false);
  const [changesDescription, setChangesDescription] = useState('Run from UI');

  const handleRunComparison = async () => {
    if (!gtZipFile || !outputZipFile) return;

    setIsUploading(true);
    try {
      await runNewComparison(gtZipFile, outputZipFile);
      setIsS3DialogOpen(false);
      setGtZipFile(null);
      setOutputZipFile(null);
      window.location.reload();
    } catch (error) {
      console.error('Failed to run comparison:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunS3Comparison = async () => {
    if (!selectedGtFolder || !selectedOutputFolder) return;

    setIsS3Comparing(true);
    try {
      await runS3Comparison(selectedGtFolder, selectedOutputFolder, changesDescription);
      setIsS3DialogOpen(false);
      setSelectedGtFolder(null);
      setSelectedOutputFolder(null);
      setChangesDescription('Run from UI');
      window.location.reload();
    } catch (error) {
      console.error('Failed to run S3 comparison:', error);
    } finally {
      setIsS3Comparing(false);
    }
  };

  // New function to load folder names when the S3 dialog is opened
  const loadS3Folders = async () => {
    try {
      const gt = await fetchUnprocessedGTFolders();
      setGtFolders(gt);
      const output = await fetchUnprocessedOutputFolders();
      setOutputFolders(output);
    } catch (error) {
      console.error('Failed to load S3 folders:', error);
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
          <Dialog open={isLocalUploadDialogOpen} onOpenChange={setIsLocalUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Client Side
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

          {/* NEW SERVER SIDE S3 COMPARISON DIALOG TRIGGER */}
          <Dialog
            open={isS3DialogOpen}
            onOpenChange={(isOpen) => {
              setIsS3DialogOpen(isOpen);
              if (isOpen) {
                loadS3Folders();
              } else {
                setSelectedGtFolder(null);
                setSelectedOutputFolder(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Server Side
              </Button>
            </DialogTrigger>
            <DialogContent className="z-[51]">
              <DialogHeader>
                <DialogTitle>Select S3 Folders</DialogTitle>
                <DialogDescription>
                  Choose Ground Truth and Output folders already uploaded to S3.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="gt-folder">Ground Truth Folder</Label>
                  {/* Select dropdown for GT folders */}
                  <select
                    id="gt-folder"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedGtFolder || ''}
                    onChange={(e) => setSelectedGtFolder(e.target.value)}
                  >
                    <option value="" disabled>Select GT Folder</option>
                    {gtFolders.map(folder => (
                      <option key={folder} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="output-folder">Output Folder</Label>
                  {/* Select dropdown for Output folders */}
                  <select
                    id="output-folder"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedOutputFolder || ''}
                    onChange={(e) => setSelectedOutputFolder(e.target.value)}
                  >
                    <option value="" disabled>Select Output Folder</option>
                    {outputFolders.map(folder => (
                      <option key={folder} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
                {/* Input for Changes Description */}
                <div className="grid gap-2">
                  <Label htmlFor="changes-description">Changes Description</Label>
                  <Input
                    id="changes-description"
                    type="text"
                    value={changesDescription}
                    onChange={(e) => setChangesDescription(e.target.value)}
                    placeholder="Enter description for this run"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleRunS3Comparison}
                  disabled={!selectedGtFolder || !selectedOutputFolder || isS3Comparing}
                >
                  {isS3Comparing ? 'Comparing...' : 'Run S3 Comparison'}
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
              <div className="checkbox-item">
                <Checkbox
                  id="json-result"
                  checked={state.showJsonResult}
                  onCheckedChange={(checked) =>
                    onStateChange({ ...state, showJsonResult: !!checked })
                  }
                />
                <Label htmlFor="json-result">JSON Result</Label>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
