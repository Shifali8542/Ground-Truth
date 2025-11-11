import type { ComparisonRun, IndentationSummaryData, RunDetailPageResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.18:8000/';

// When user Uplaod GT and Output Zip files and click on Run Comparison button then this function will be called
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

// When user Click on GT folders dropdown in run compariosn then this function will be called
export async function fetchUnprocessedGTFolders(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}api/unprocessed-folders/gt/`);

  if (!response.ok) {
    throw new Error('Failed to fetch unprocessed GT folders');
  }

  return response.json();
}
// When user Click on Output folders dropdown in run compariosn then this function will be called
export async function fetchUnprocessedOutputFolders(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}api/unprocessed-folders/output/`);

  if (!response.ok) {
    throw new Error('Failed to fetch unprocessed Output folders');
  }

  return response.json();
}

// New function to run a comparison between two S3 folders
export async function runS3Comparison(gtFolderName: string, outputFolderName: string, description: string): Promise<{ runId: string }> {
  const response = await fetch(`${API_BASE_URL}api/compare-s3-folders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      changes_description: description,
      gt_folder_name: gtFolderName,
      running_folder_name: outputFolderName,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to run S3 comparison');
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

// New function to delete a specific run by its timestamp
export async function deleteRun(runTimestamp: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}api/runs/${runTimestamp}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete run ${runTimestamp}`);
  }
}

// When any user click for Indentation Result then this function will be called
export async function fetchIndentationSummary(): Promise<IndentationSummaryData[]> {
  const response = await fetch(`${API_BASE_URL}/api/indent/summary/all_runs/`);

  if (!response.ok) {
    throw new Error('Failed to fetch indentation summary'); 
  }

  return response.json();
}

// When any user Click for Content Run Details Page then this function will be called
export async function fetchRunDetailPage(runId: string): Promise<RunDetailPageResult[]> {
  const response = await fetch(`${API_BASE_URL}api/runs/${runId}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch run detail page for ${runId}`);
  }

  return response.json();
}

// When user click for  Indentation Details Page then this function will be called
export async function fetchIndentationDetailPage(runId: string): Promise<RunDetailPageResult[]> {
  const response = await fetch(`${API_BASE_URL}api/indent/runs/${runId}/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch indentation detail page for ${runId}`);
  }

  return response.json();
}

// When any user click for view page in content run details page  then this function will be called
export async function fetchFileThreeWayView(runId: string, fileName: string, pageNum: number): Promise<any> {
  const url = `${API_BASE_URL}api/runs/${runId}/files/${encodeURIComponent(fileName)}/?page=${pageNum}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file three-way view for ${fileName} in run ${runId}`);
  }

  return response.json();
}

// When any user click for view page in indentation run details page then this function will be called
export async function fetchIndentationFileThreeWayView(runId: string, fileName: string, pageNum: number): Promise<any> {
  const stemParts = fileName.split('_');
  const fileStem = stemParts.slice(0, stemParts.length - 1).join('_'); 
  const url = `${API_BASE_URL}api/indent/runs/${runId}/files/${encodeURIComponent(fileStem)}/?page=${pageNum}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch indentation file three-way view for ${fileStem} in run ${runId}`);
  }

  return response.json();
}
