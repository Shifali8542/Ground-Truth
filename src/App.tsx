import { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
// UPDATE IMPORT: fetchFileDetailPage is replaced by fetchFileThreeWayView
import { fetchAllRuns, fetchRunDetails, fetchFileDiff, fetchIndentationSummary, fetchRunDetailPage, fetchIndentationDetailPage, fetchFileThreeWayView } from './api';
import type { SidebarState, ComparisonRun, FileResult, FileDiffRow, IndentationSummaryData, RunDetailPageResult } from './types';

function App() {
  type View = 'finalSummary' | 'runSummary' | 'fileDiff' | 'indentationResult' | 'runDetails';
  const [state, setState] = useState<SidebarState>({
    currentView: 'finalSummary',
    columnToggle: 'all',
    selectedRunId: null,
    selectedFileName: null,
    selectedFileSuffix: null,
    showFinalSummary: true,
    showIndentationResult: false,
    showRunSummary: false, 
    showFileDiff: false,
  });

  useEffect(() => {
    if (state.showIndentationResult) {
      setState(prev => ({ ...prev, currentView: 'indentationResult' }));
    } else if (state.showRunSummary && state.selectedRunId) {
      setState(prev => ({ ...prev, currentView: 'runSummary' }));
    } else if (state.showFileDiff && state.selectedRunId && state.selectedFileName && state.selectedFileSuffix) {
      setState(prev => ({ ...prev, currentView: 'fileDiff' }));
    } else if (state.showFinalSummary) {
      setState(prev => ({ ...prev, currentView: 'finalSummary' }));
    }
  }, [state.showFinalSummary, state.showIndentationResult, state.showRunSummary, state.showFileDiff, state.selectedRunId, state.selectedFileName, state.selectedFileSuffix]);

  const [allRuns, setAllRuns] = useState<ComparisonRun[]>([]);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [fileDiff, setFileDiff] = useState<FileDiffRow[]>([]);
  const [indentationResults, setIndentationResults] = useState<IndentationSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [runDetailsData, setRunDetailsData] = useState<RunDetailPageResult[]>([]);
  const [detailRunId, setDetailRunId] = useState<string | null>(null);
  const [indentationDetailRunId, setIndentationDetailRunId] = useState<string | null>(null);
  const [fileDetailData, setFileDetailData] = useState<any>(null);
  const [fileDetailFileName, setFileDetailFileName] = useState<string | null>(null);
  const [fileDetailRunId, setFileDetailRunId] = useState<string | null>(null);
  // ADD NEW STATE: To manage the current page number for the 3-way viewer
  const [fileDetailPageNum, setFileDetailPageNum] = useState<number>(1); // ADD
  const [isDetailsLoading, setIsDetailsLoading] = useState<boolean>(false);
  useEffect(() => {
    async function loadRuns() {
      try {
        const runs = await fetchAllRuns();
        setAllRuns(runs);
        const indentationData = await fetchIndentationSummary();
        setIndentationResults(indentationData);
      } catch (error) {
        console.error('Failed to fetch runs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRuns();
  }, []);

 useEffect(() => {
    if (state.showIndentationResult) {
      setState(prev => ({ ...prev, currentView: 'indentationResult' }));
    } else if (state.showRunSummary && state.selectedRunId) {
      setState(prev => ({ ...prev, currentView: 'runSummary' }));
    } else if (state.showFileDiff && state.selectedRunId && state.selectedFileName && state.selectedFileSuffix) {
      setState(prev => ({ ...prev, currentView: 'fileDiff' }));
    } else if (state.showFinalSummary) {
      setState(prev => ({ ...prev, currentView: 'finalSummary' }));
    }
  }, [state.showFinalSummary, state.showIndentationResult, state.showRunSummary, state.showFileDiff, state.selectedRunId, state.selectedFileName, state.selectedFileSuffix]);

  useEffect(() => {
    if (!state.selectedRunId) {
      setFileResults([]);
      return;
    }

    async function loadRunDetails() {
      try {
        const details = await fetchRunDetails(state.selectedRunId!);
        setFileResults(details);
      } catch (error) {
        console.error('Failed to fetch run details:', error);
      }
    }

    loadRunDetails();
  }, [state.selectedRunId]);

  useEffect(() => {
    if (!state.selectedRunId || !state.selectedFileName || !state.selectedFileSuffix) {
      setFileDiff([]);
      return;
    }

    async function loadFileDiff() {
      try {
        const diff = await fetchFileDiff(
          state.selectedRunId!,
          state.selectedFileName!,
          state.selectedFileSuffix!
        );
        setFileDiff(diff);
      } catch (error) {
        console.error('Failed to fetch file diff:', error);
      }
    }

    loadFileDiff();
  }, [state.selectedRunId, state.selectedFileName, state.selectedFileSuffix]);

  useEffect(() => {
    if (!detailRunId) {
      setRunDetailsData([]);
      // Ensure the view is NOT stuck on 'runDetails' if the ID is cleared
      if (state.currentView === 'runDetails') {
        setState(prev => ({ ...prev, currentView: 'finalSummary' }));
      }
      return;
    }

    async function loadRunDetailsPage() {
      try {
        const details = await fetchRunDetailPage(detailRunId!);
        setRunDetailsData(details);
        // Change view ONLY after successful data fetch
        setState(prev => ({ ...prev, currentView: 'runDetails' })); 
      } catch (error) {
        console.error('Failed to fetch run detail page:', error);
        // Fallback on error to prevent being stuck in a loading loop
        setDetailRunId(null);
        setState(prev => ({ ...prev, currentView: 'finalSummary' }));
      }
    }

    loadRunDetailsPage();
  }, [detailRunId]);

  useEffect(() => {
    if (!indentationDetailRunId) {
      setRunDetailsData([]);
      // Ensure the view is NOT stuck on 'runDetails' if the ID is cleared
      if (state.currentView === 'runDetails') {
        setState(prev => ({ ...prev, currentView: 'indentationResult' })); // Assume back to indentation view
      }
      return;
    }

    async function loadIndentationDetailsPage() {
      try {
        const details = await fetchIndentationDetailPage(indentationDetailRunId!);
        setRunDetailsData(details);
        setState(prev => ({ ...prev, currentView: 'runDetails' }));
      } catch (error) {
        console.error('Failed to fetch indentation detail page:', error);
        setIndentationDetailRunId(null);
        setState(prev => ({ ...prev, currentView: 'indentationResult' }));
      }
    }

    loadIndentationDetailsPage();
  }, [indentationDetailRunId]);

  // UPDATE useEffect: To handle fetching the three-way view data with page number
  useEffect(() => {
    // Condition now depends on page number as well
    if (!fileDetailFileName || !fileDetailRunId) {
      setFileDetailData(null);
      setFileDetailPageNum(1); // Reset page on close
      return;
    }

    async function loadFileThreeWayView() { // RENAMED FUNCTION
      try {
        // CALL NEW API FUNCTION with pageNum
        const data = await fetchFileThreeWayView(fileDetailRunId!, fileDetailFileName!, fileDetailPageNum); 
        
        if (data) { // Check for data presence
            setFileDetailData(data);
        } else {
            console.warn('File detail API returned empty data.');
            throw new Error('Empty data returned.'); 
        }
      } catch (error) {
        console.error('Failed to fetch file three-way view, resetting view:', error);
        setFileDetailData(null); 
        setFileDetailFileName(null); 
        setFileDetailRunId(null);
        setFileDetailPageNum(1); // Reset page on error
        alert("Error loading file details. Please check the server."); 
      }
    }

    loadFileThreeWayView(); // CALL RENAMED FUNCTION
  }, [fileDetailFileName, fileDetailRunId, fileDetailPageNum]); // ADD fileDetailPageNum as dependency

  return (
    <div className="app">
      <Sidebar
        state={state}
        onStateChange={setState}
        allRuns={allRuns}
        fileResults={fileResults}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <MainContent
        state={state}
        onStateChange={setState}
        allRuns={allRuns}
        fileResults={fileResults}
        fileDiff={fileDiff}
        indentationResults={indentationResults}
        isSidebarOpen={isSidebarOpen}
        runDetailsData={runDetailsData}
        detailRunId={detailRunId}
        setDetailRunId={setDetailRunId}
        indentationDetailRunId={indentationDetailRunId}
        setIndentationDetailRunId={setIndentationDetailRunId}
        fileDetailData={fileDetailData}
        setFileDetailData={setFileDetailData}
        setFileDetailFileName={setFileDetailFileName}
        setFileDetailRunId={setFileDetailRunId}
        // ADD NEW PROPS
        fileDetailPageNum={fileDetailPageNum}
        setFileDetailPageNum={setFileDetailPageNum}
      />
    </div>
  );
}

export default App;