import { AnimatePresence } from 'framer-motion';
import { AllRunsTable } from '../dashboard/AllRunsTable/AllRunsTable';
import { RunSummaryTable } from '../dashboard/RunSummaryTable/RunSummaryTable';
import { FileDiffView } from '../dashboard/FileDiffView/FileDiffView';
import { IndentationSummaryTable } from '../dashboard/IndentationSummaryTable/IndentationSummaryTable';
import { RunDetailsPage } from '../dashboard/RunDetailsPage/RunDetailsPage'; // <-- IMPORT NEW PAGE
import type { SidebarState, ComparisonRun, FileResult, FileDiffRow, IndentationSummaryData, RunDetailPageResult } from '../../types'; // <-- IMPORT RunDetailPageResult
import './MainContent.scss';

interface MainContentProps {
  state: SidebarState;
  allRuns: ComparisonRun[];
  fileResults: FileResult[];
  fileDiff: FileDiffRow[];
  indentationResults: IndentationSummaryData[];
  isSidebarOpen: boolean;
  // New Props
  runDetailsData: RunDetailPageResult[];
  detailRunId: string | null;
  setDetailRunId: (runId: string | null) => void;
  indentationDetailRunId: string | null;
  setIndentationDetailRunId: (runId: string | null) => void;
}

export function MainContent({
  state,
  allRuns,
  fileResults,
  fileDiff,
  indentationResults,
  isSidebarOpen,
  runDetailsData,
  detailRunId,
  setDetailRunId,
  indentationDetailRunId,
  setIndentationDetailRunId,
}: MainContentProps) {

  const handleRunDetailsClick = (runId: string) => {
    setDetailRunId(runId);
  };

  const handleGoBack = () => {
    setDetailRunId(null);
    setIndentationDetailRunId(null);
  };

  if (detailRunId || indentationDetailRunId) { 
    const currentRunId = detailRunId || indentationDetailRunId;

    return (
      <main className={`main-content ${isSidebarOpen ? '' : 'is-collapsed'}`}>
        <div className="content-wrapper">
          {runDetailsData.length > 0 ? (
            <RunDetailsPage 
              data={runDetailsData} 
              runId={currentRunId}
              onGoBack={handleGoBack}
              state={state}
            />
          ) : (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading run details...</p>
            </div>
          )}
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
              <RunSummaryTable results={fileResults} columnToggle={state.columnToggle} />
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
                <FileDiffView
                  diffData={fileDiff}
                  fileName={state.selectedFileName}
                  fileSuffix={state.selectedFileSuffix}
                  runId={state.selectedRunId}
                />
              </div>
            )}
        </AnimatePresence>

        {state.currentView === 'finalSummary' && !detailRunId && (
          <div className="empty-state">
            <h2>Welcome to GT Comparison Dashboard</h2>
            <p>Select display options from the sidebar to view comparison results.</p>
          </div>
        )}
      </div>
    </main>
  );
}