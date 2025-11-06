import type { ComparisonRun, FileResult, FileDiffRow, IndentationSummaryData, RunDetailPageResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.11:8000/';

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

export async function fetchAllRuns(): Promise<ComparisonRun[]> {
  const response = await fetch(`${API_BASE_URL}api/summary/all_runs/`);

  if (!response.ok) {
    throw new Error('Failed to fetch runs');
  }

  return response.json();
}

export async function fetchIndentationSummary(): Promise<IndentationSummaryData[]> {
  const response = await fetch(`${API_BASE_URL}/api/indent/summary/all_runs/`);

  if (!response.ok) {
    throw new Error('Failed to fetch indentation summary'); 
  }

  return response.json();
}

export async function fetchRunDetails(runId: string): Promise<FileResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/comparison/runs/${runId}/details`);

  if (!response.ok) {
    throw new Error('Failed to fetch run details');
  }

  return response.json();
}

export async function fetchFileDiff(
  runId: string,
  fileName: string,
  fileSuffix: string
): Promise<FileDiffRow[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/comparison/runs/${runId}/diff?fileName=${encodeURIComponent(fileName)}&suffix=${encodeURIComponent(fileSuffix)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch file diff');
  }

  return response.json();
}
export async function fetchRunDetailPage(runId: string): Promise<RunDetailPageResult[]> {
  const response = await fetch(`${API_BASE_URL}api/runs/${runId}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch run detail page for ${runId}`);
  }

  return response.json();
}

export async function fetchIndentationDetailPage(runId: string): Promise<RunDetailPageResult[]> {
  const response = await fetch(`${API_BASE_URL}api/indent/runs/${runId}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch indentation detail page for ${runId}`);
  }

  return response.json();
}

// ADD NEW FUNCTION: fetchFileThreeWayView
export async function fetchFileThreeWayView(runId: string, fileName: string, pageNum: number): Promise<any> {
  // We assume the backend API structure is run/<str:run_timestamp>/files/<str:file_name>/?page=<int:page_num>
  const url = `${API_BASE_URL}api/runs/${runId}/files/${encodeURIComponent(fileName)}/?page=${pageNum}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file three-way view for ${fileName} in run ${runId}`);
  }

  return response.json();
}

// REMOVE the existing fetchFileDetailPage function
/*
export async function fetchFileDetailPage(runId: string, fileName: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}api/runs/${runId}/files/${encodeURIComponent(fileName)}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch file detail page for ${fileName} in run ${runId}`);
  }

  return response.json();
}
*/