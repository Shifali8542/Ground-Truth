import { AnimatePresence } from 'framer-motion';
import { AllRunsTable } from '../dashboard/AllRunsTable/AllRunsTable';
import { IndentationSummaryTable } from '../dashboard/IndentationSummaryTable/IndentationSummaryTable';
import { RunDetailsPage } from '../dashboard/RunDetailsPage/RunDetailsPage';
import { FileThreeWayView } from '../dashboard/ViewPage/ViewPage';
import type { SidebarState, ComparisonRun,IndentationSummaryData, RunDetailPageResult } from '../../types';
import './MainContent.scss';

interface MainContentProps {
  state: SidebarState;
  onStateChange: (newState: SidebarState | ((prevState: SidebarState) => SidebarState)) => void;
  allRuns: ComparisonRun[];
  indentationResults: IndentationSummaryData[];
  isSidebarOpen: boolean;
  runDetailsData: RunDetailPageResult[];
  detailRunId: string | null;
  setDetailRunId: (runId: string | null) => void;
  indentationDetailRunId: string | null;
  setIndentationDetailRunId: (runId: string | null) => void;
  fileDetailData: any;
  setFileDetailData: (data: any) => void;
  setFileDetailFileName: (fileName: string | null) => void;
  fileDetailRunId: string | null;
  setFileDetailRunId: (runId: string | null) => void;
  fileDetailPageNum: number;
  setFileDetailPageNum: (pageNum: number) => void;
}

export function MainContent({
  state,
  onStateChange,
  allRuns,
  indentationResults,
  isSidebarOpen,
  runDetailsData,
  detailRunId,
  setDetailRunId,
  indentationDetailRunId,
  setIndentationDetailRunId,
  fileDetailData,
  setFileDetailData,
  setFileDetailFileName,
  fileDetailRunId,
  setFileDetailRunId,
  fileDetailPageNum,
  setFileDetailPageNum,
}: MainContentProps) {

  const handleRunDetailsClick = (runId: string) => {
    setDetailRunId(runId);
  };

  const handleGoBack = () => {
    const targetView = detailRunId ? 'showFinalSummary' : 'showIndentationResult';
    setDetailRunId(null);
    setIndentationDetailRunId(null);
    onStateChange(prev => ({
      ...prev,
      showFinalSummary: targetView === 'showFinalSummary',
      showIndentationResult: targetView === 'showIndentationResult',
      currentView: targetView === 'showFinalSummary' ? 'finalSummary' : 'indentationResult', // Explicitly set currentView
    }));
  };

  // To handle page change from the three-way view
  const handlePageChange = (newPage: number) => {
    setFileDetailPageNum(newPage);
  };

  // handle saving GT changes
  const handleSaveChanges = (updatedData: any) => {
    console.log("Saving changes for run:", updatedData.Run_Id, "file:", updatedData.File_Name, "page:", updatedData.Page_Num);
    console.log("Updated comparison data slice:", updatedData.comparison_data.slice(0, 5));
  };

  if (fileDetailData) {
    const viewDataWithRunId = {
      ...fileDetailData,
      Run_Id: fileDetailRunId
    };
    return (
      <main className={`main-content ${isSidebarOpen ? '' : 'is-collapsed'}`}>
        <div className="content-wrapper">
          <FileThreeWayView
            data={viewDataWithRunId}
            onClose={() => {
              setFileDetailData(null);
              setFileDetailFileName(null);
              setFileDetailRunId(null);
              setFileDetailPageNum(1); 
            }}
            onPageChange={handlePageChange} 
            onSave={handleSaveChanges}
          />
        </div>
      </main>
    );
  }
  // To handle clicking "View Page" from RunDetailsPage, setting the initial page number
  const handleViewFileDetails = (fileName: string, runId: string, pageNum: number) => {
    setFileDetailFileName(fileName);
    setFileDetailRunId(runId);
    setFileDetailPageNum(pageNum);
  };

  if (detailRunId || indentationDetailRunId) {
    const currentRunId = detailRunId || indentationDetailRunId;

    return (
      <main className={`main-content ${isSidebarOpen ? '' : 'is-collapsed'}`}>
        <div className="content-wrapper">
          <RunDetailsPage
            data={runDetailsData}
            runId={currentRunId}
            onGoBack={handleGoBack}
            state={state}
            onViewFileDetails={handleViewFileDetails}
          />
        </div>
      </main>
    );
  }


  return (
    <main className={`main-content ${isSidebarOpen ? '' : 'is-collapsed'}`}>
      <div className="content-wrapper">
        <AnimatePresence mode="sync">
          {state.currentView === 'finalSummary' && state.showFinalSummary && (
            <div className="content-section">
              <AllRunsTable runs={allRuns} onRunClick={(runId) => setDetailRunId(runId)} />
            </div>
          )}

          {state.currentView === 'runSummary' && state.selectedRunId && state.showRunSummary && (
            <div className="content-section">
            </div>
          )}

          {state.currentView === 'indentationResult' && state.showIndentationResult && ( // <-- UPDATED BLOCK
            <div className="content-section">
              <IndentationSummaryTable
                runs={indentationResults}
                onRunClick={setIndentationDetailRunId}
              />
            </div>
          )}

          {state.currentView === 'fileDiff' &&
            state.selectedRunId &&
            state.selectedFileName &&
            state.selectedFileSuffix &&
            state.showFileDiff && (
              <div className="content-section">

              </div>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}