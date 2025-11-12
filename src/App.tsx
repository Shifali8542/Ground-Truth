import { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { fetchAllRuns, fetchIndentationSummary, fetchRunDetailPage, fetchIndentationDetailPage, fetchFileThreeWayView, fetchIndentationFileThreeWayView, deleteRun } from './api';
import type { SidebarState, ComparisonRun, IndentationSummaryData, RunDetailPageResult } from './types';
import Loader from '././components/ui/loader';

function App() {
  type View = 'finalSummary' | 'runSummary' | 'indentationResult' | 'runDetails';
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
  const [indentationResults, setIndentationResults] = useState<IndentationSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [runDetailsData, setRunDetailsData] = useState<RunDetailPageResult[]>([]);
  const [detailRunId, setDetailRunId] = useState<string | null>(null);
  const [indentationDetailRunId, setIndentationDetailRunId] = useState<string | null>(null);
  const [fileDetailData, setFileDetailData] = useState<any>(null);
  const [fileDetailFileName, setFileDetailFileName] = useState<string | null>(null);
  const [fileDetailRunId, setFileDetailRunId] = useState<string | null>(null);
  const [fileDetailPageNum, setFileDetailPageNum] = useState<number>(1);
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
    if (!detailRunId) {
      setRunDetailsData([]);
      if (state.currentView === 'runDetails') {
        setState(prev => ({ ...prev, currentView: 'finalSummary' }));
      }
      return;
    }

    async function loadRunDetailsPage() {
      setIsDetailsLoading(true);
      try {
        const details = await fetchRunDetailPage(detailRunId!);
        setRunDetailsData(details);
        setState(prev => ({ ...prev, currentView: 'runDetails' }));
      } catch (error) {
        console.error('Failed to fetch run detail page:', error);
        setDetailRunId(null);
        setState(prev => ({ ...prev, currentView: 'finalSummary' }));
      } finally {
        setIsDetailsLoading(false);
      }
    }

    loadRunDetailsPage();
  }, [detailRunId]);

  useEffect(() => {
    if (!indentationDetailRunId) {
      setRunDetailsData([]);
      if (state.currentView === 'runDetails') {
        setState(prev => ({ ...prev, currentView: 'indentationResult' }));
      }
      return;
    }

    async function loadIndentationDetailsPage() {
      setIsDetailsLoading(true);
      try {
        const details = await fetchIndentationDetailPage(indentationDetailRunId!);
        setRunDetailsData(details);
        setState(prev => ({ ...prev, currentView: 'runDetails' }));
      } catch (error) {
        console.error('Failed to fetch indentation detail page:', error);
        setIndentationDetailRunId(null);
        setState(prev => ({ ...prev, currentView: 'indentationResult' }));
      } finally {
        setIsDetailsLoading(false);
      }
    }

    loadIndentationDetailsPage();
  }, [indentationDetailRunId]);

  useEffect(() => {
    if (!fileDetailFileName || !fileDetailRunId) {
      setFileDetailData(null);
      setFileDetailPageNum(1);
      return;
    }
    const isIndentationView = !!indentationDetailRunId;
    const fetchApi = isIndentationView ? fetchIndentationFileThreeWayView : fetchFileThreeWayView;

    async function loadFileThreeWayView() {
      setIsDetailsLoading(true);
      try {
        const data = await fetchApi(fileDetailRunId!, fileDetailFileName!, fileDetailPageNum);

        if (data) {
          setFileDetailData(data);
          if (data.pagination && data.pagination.currentPage !== fileDetailPageNum) {
            setFileDetailPageNum(data.pagination.currentPage);
          }
        } else {
          console.warn('File detail API returned empty data.');
          throw new Error('Empty data returned.');
        }
      } catch (error) {
        console.error('Failed to fetch file three-way view, resetting view:', error);
        setFileDetailData(null);
        setFileDetailFileName(null);
        setFileDetailRunId(null);
        setFileDetailPageNum(1);
        alert("Error loading file details. Please check the server.");
      } finally {
        setIsDetailsLoading(false);
      }
    }

    loadFileThreeWayView();
  }, [fileDetailFileName, fileDetailRunId, fileDetailPageNum, indentationDetailRunId]);

  const handleRunDelete = async (runId: string) => {

    setIsLoading(true);
    try {
      await deleteRun(runId);
      setAllRuns(prevRuns => prevRuns.filter(run => run.Date_Time !== runId));
      if (state.selectedRunId === runId || detailRunId === runId) {
        setState(prev => ({ ...prev, selectedRunId: null, showRunSummary: false, currentView: 'finalSummary' }));
        setDetailRunId(null);
      }
    } catch (error) {
      console.error('Failed to delete run:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDetailsLoading) {
    return <Loader />;
  }

  return (
    <div className="app">
      <Sidebar
        state={state}
        onStateChange={setState}
        allRuns={allRuns}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <MainContent
        state={state}
        onStateChange={setState}
        allRuns={allRuns}
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
        fileDetailPageNum={fileDetailPageNum}
        setFileDetailPageNum={setFileDetailPageNum}
        fileDetailRunId={fileDetailRunId}
        onRunDelete={handleRunDelete}
      />
    </div>
  );
}

export default App;