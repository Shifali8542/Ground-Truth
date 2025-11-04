export interface ComparisonRun {
  id: string;
  Date_Time: string; 
  Changes_Description: string;
  No_of_Files_Processed: number;
  total_paragraphs: number;
  content_matches: number;
  content_match_percentage: number;
  TP_superscript: number;
  FN_superscript: number;
  FP_superscript: number;
  superscript_matches: number;
  superscript_match_percentage: number;
}

export interface IndentationSummaryData {
  Date_Time: string;
  Changes_Description: string;
  No_of_Files_Processed: number;
  total_rows: number;
  row_match_percentage: number;
  indentation_level_match_percentage: number;
  parent_text_match_percentage: number;
  row_data_match_percentage: number;
}

export interface FileResult {
  file_name: string;
  page_num: number;
  total_paragraphs: number;
  content_matches: number;
  content_match_percentage: number;
  tp_superscript: number;
  fp_superscript: number;
  fn_superscript: number;
  tp_font_info: number;
  fp_font_info: number;
  fn_font_info: number;
}

export interface FileDiffRow {
  index: number;
  content_output: string;
  content_gt: string;
}

export interface RunDetailPageResult {
  File_Name: string;
  Page_Num: string;
  total_paragraphs: number;
  content_matches: number;
  content_match_percentage: number;
  TP_superscript: number;
  FP_superscript: number;
  FN_superscript: number;
  superscript_matches: number;
  superscript_match_percentage: number;
}

export interface SidebarState {
  currentView: 'finalSummary' | 'runSummary' | 'fileDiff' | 'indentationResult' | 'runDetails'; 
  columnToggle: 'all' | 'superscript' | 'font_info';
  selectedRunId: string | null;
  selectedFileName: string | null;
  selectedFileSuffix: string | null;
  showFinalSummary: boolean; 
  showIndentationResult: boolean;
  showRunSummary: boolean;  
  showFileDiff: boolean;
}
