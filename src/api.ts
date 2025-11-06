import type { ComparisonRun, IndentationSummaryData, RunDetailPageResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.11:8000/';

// When any user Uplaod GT and Output Zip files and click on Run Comparison button then this function will be called
export async function runNewComparison(gtZip: File, outputZip: File): Promise<{ runId: string }> {
  const formData = new FormData();
  formData.append('gt_zip', gtZip);
  formData.append('running_zip', outputZip);

  const response = await fetch(`${API_BASE_URL}api/upload-and-compare/`, { 
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to run comparison');
  }
  return response.json();
}

// When user click on Superscript Summary Results then this function will be called
export async function fetchAllRuns(): Promise<ComparisonRun[]> {
  const response = await fetch(`${API_BASE_URL}api/summary/all_runs/`);

  if (!response.ok) {
    throw new Error('Failed to fetch runs');
  }

  return response.json();
}

// When any user click on Indentation Result then this function will be called
export async function fetchIndentationSummary(): Promise<IndentationSummaryData[]> {
  const response = await fetch(`${API_BASE_URL}/api/indent/summary/all_runs/`);

  if (!response.ok) {
    throw new Error('Failed to fetch indentation summary'); 
  }

  return response.json();
}

// When any user Click on Content Run Details Page then this function will be called
export async function fetchRunDetailPage(runId: string): Promise<RunDetailPageResult[]> {
  const response = await fetch(`${API_BASE_URL}api/runs/${runId}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch run detail page for ${runId}`);
  }

  return response.json();
}

// When user click on Indentation Details Page then this function will be called
export async function fetchIndentationDetailPage(runId: string): Promise<RunDetailPageResult[]> {
  const response = await fetch(`${API_BASE_URL}api/indent/runs/${runId}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch indentation detail page for ${runId}`);
  }

  return response.json();
}

// When any user click on view page then this function will be called
export async function fetchFileThreeWayView(runId: string, fileName: string, pageNum: number): Promise<any> {
  const url = `${API_BASE_URL}api/runs/${runId}/files/${encodeURIComponent(fileName)}/?page=${pageNum}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file three-way view for ${fileName} in run ${runId}`);
  }

  return response.json();
}
