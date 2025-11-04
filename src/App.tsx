import { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { fetchAllRuns, fetchRunDetails, fetchFileDiff, fetchIndentationSummary, fetchRunDetailPage, fetchIndentationDetailPage } from './api';
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
  const [runDetailsData, setRunDetailsData] = useState<RunDetailPageResult[]>([]); // <-- NEW
  const [detailRunId, setDetailRunId] = useState<string | null>(null);
  const [indentationDetailRunId, setIndentationDetailRunId] = useState<string | null>(null);

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
    if (detailRunId || indentationDetailRunId) {
      setState(prev => ({ ...prev, currentView: 'runDetails' })); 
      return;
    }

    if (state.showIndentationResult) {
      setState(prev => ({ ...prev, currentView: 'indentationResult' }));
    } else if (state.showRunSummary && state.selectedRunId) {
      setState(prev => ({ ...prev, currentView: 'runSummary' }));
    } else if (state.showFileDiff && state.selectedRunId && state.selectedFileName && state.selectedFileSuffix) {
      setState(prev => ({ ...prev, currentView: 'fileDiff' }));
    } else if (state.showFinalSummary) {
      setState(prev => ({ ...prev, currentView: 'finalSummary' }));
    }
  }, [state.showFinalSummary, state.showIndentationResult, state.showRunSummary, state.showFileDiff, state.selectedRunId, state.selectedFileName, state.selectedFileSuffix, detailRunId, indentationDetailRunId]);

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
      return;
    }

    async function loadRunDetailsPage() {
      try {
        if (detailRunId) {
          const details = await fetchRunDetailPage(detailRunId);
          setRunDetailsData(details);
        }
      } catch (error) {
        console.error('Failed to fetch run detail page:', error);
      }
    }

    loadRunDetailsPage();
  }, [detailRunId]);

  useEffect(() => { 
    if (!indentationDetailRunId) {
      setRunDetailsData([]);
      return;
    }

    async function loadIndentationDetailsPage() {
      try {
        if (indentationDetailRunId) {
          const details = await fetchIndentationDetailPage(indentationDetailRunId);
          setRunDetailsData(details);
        }
      } catch (error) {
        console.error('Failed to fetch indentation detail page:', error);
      }
    }

    loadIndentationDetailsPage();
  }, [indentationDetailRunId]); 

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
      />
    </div>
  );
}

export default App;
