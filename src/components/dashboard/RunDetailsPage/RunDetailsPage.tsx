import { motion } from 'framer-motion';
import { ChevronLeft, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import type { RunDetailPageResult, SidebarState } from '../../../types';
import { formatRunDateTime } from '../../../lib/utils';
import './RunDetailsPage.scss';

interface RunDetailsPageProps {
  data: RunDetailPageResult[];
  runId: string | null;
  onGoBack: () => void;
  state: SidebarState;
  // UPDATE PROP: Add initial page number to the view function
  onViewFileDetails: (fileName: string, runId: string, pageNum: number) => void;
}

export function RunDetailsPage({ data, runId, onGoBack, state, onViewFileDetails }: RunDetailsPageProps) {
  const isIndentationDetails = data.some((item: any) => 'total_rows' in item);
  const totalFiles = data.length;
  const totalParagraphs = data.reduce((sum, item: any) => sum + (item.total_paragraphs || 0), 0);
  const totalMatches = data.reduce((sum, item: any) => sum + (item.content_matches || 0), 0);
  const totalTPSuperscript = data.reduce((sum, item: any) => sum + (item.TP_superscript || 0), 0);
  const totalFPSuperscript = data.reduce((sum, item: any) => sum + (item.FP_superscript || 0), 0);
  const totalFNSuperscript = data.reduce((sum, item: any) => sum + (item.FN_superscript || 0), 0);
  const totalSuperscriptMatches = data.reduce((sum, item: any) => sum + (item.superscript_matches || 0), 0);
  const contentMatchOverall = totalParagraphs > 0 ? (totalMatches / totalParagraphs) * 100 : 0;
  const superscriptMatchOverall = totalParagraphs > 0 ? (totalSuperscriptMatches / totalParagraphs) * 100 : 0;
  const totalRows = data.reduce((sum, item: any) => sum + (item.total_rows || 0), 0);
  const overallIndentationMatchPercentage = data.reduce((sum, item: any) => sum + (item.row_match_percentage || 0), 0) / data.length;

  // Function to determine color based on match percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 95) return 'success';
    if (percentage >= 80) return 'warning';
    return 'danger';
  };

  const getMatchColorClass = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formattedDateTime = runId ? formatRunDateTime(runId) : 'N/A';
  const currentRunId = runId || state.selectedRunId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="run-details-page"
    >
      {/* HEADER */}
      <div className="details-header">
        <div className="header-content">
          <div className="header-title-section">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h2 className="header-title">
                {isIndentationDetails ? 'Indentation Run Details' : 'Content Run Details'}
              </h2>
              <p className="header-subtitle">{formattedDateTime}</p>
            </div>
          </div>
          <Button onClick={onGoBack} variant="outline" size="lg">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Summary
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-cards-grid">
        <Card className="summary-card">
          <CardHeader className="summary-card-header">
            <FileText className="summary-icon text-blue-500" />
            <CardTitle className="summary-card-title">Total Files</CardTitle>
          </CardHeader>
          <CardContent className="summary-card-content">
            <p className="summary-value">{totalFiles}</p>
            <p className="summary-label">Files Processed</p>
          </CardContent>
        </Card>

        {/* Conditional Summary Cards */}
        {!isIndentationDetails ? (
          <>
            <Card className="summary-card">
              <CardHeader className="summary-card-header">
                <FileText className="summary-icon text-purple-500" />
                <CardTitle className="summary-card-title">Total Paragraphs</CardTitle>
              </CardHeader>
              <CardContent className="summary-card-content">
                <p className="summary-value">{totalParagraphs}</p>
                <p className="summary-label">Paragraphs Analyzed</p>
              </CardContent>
            </Card>

            <Card className={`summary-card highlight-card ${getMatchColor(contentMatchOverall)}`}>
              <CardHeader className="summary-card-header">
                <CheckCircle2 className="summary-icon" />
                <CardTitle className="summary-card-title">Content Match</CardTitle>
              </CardHeader>
              <CardContent className="summary-card-content">
                <p className="summary-value">{contentMatchOverall.toFixed(2)}%</p>
                <p className="summary-label">{totalMatches} / {totalParagraphs} matches</p>
              </CardContent>
            </Card>

            <Card className={`summary-card highlight-card ${getMatchColor(superscriptMatchOverall)}`}>
              <CardHeader className="summary-card-header">
                <CheckCircle2 className="summary-icon" />
                <CardTitle className="summary-card-title">Superscript Match</CardTitle>
              </CardHeader>
              <CardContent className="summary-card-content">
                <p className="summary-value">{superscriptMatchOverall.toFixed(2)}%</p>
                <p className="summary-label">{totalSuperscriptMatches} / {totalParagraphs} matches</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="summary-card">
              <CardHeader className="summary-card-header">
                <FileText className="summary-icon text-purple-500" />
                <CardTitle className="summary-card-title">Total Rows</CardTitle>
              </CardHeader>
              <CardContent className="summary-card-content">
                <p className="summary-value">{totalRows}</p>
                <p className="summary-label">Rows Analyzed</p>
              </CardContent>
            </Card>

            <Card className={`summary-card highlight-card ${getMatchColor(overallIndentationMatchPercentage)}`}>
              <CardHeader className="summary-card-header">
                <CheckCircle2 className="summary-icon" />
                <CardTitle className="summary-card-title">Average Row Match</CardTitle>
              </CardHeader>
              <CardContent className="summary-card-content">
                <p className="summary-value">{overallIndentationMatchPercentage.toFixed(2)}%</p>
                <p className="summary-label">Avg. Match Percentage</p>
              </CardContent>
            </Card>

            {/* Placeholder card since indentation details often only have one summary metric */}
            <Card className="summary-card">
              <CardHeader className="summary-card-header">
                <AlertCircle className="summary-icon text-yellow-500" />
                <CardTitle className="summary-card-title">Run ID</CardTitle>
              </CardHeader>
              <CardContent className="summary-card-content">
                <p className="summary-value text-xl font-mono truncate">{currentRunId}</p>
                <p className="summary-label">Timestamp Identifier</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* SUPERSCRIPT BREAKDOWN - ONLY FOR CONTENT COMPARISON */}
      {!isIndentationDetails && (
        <div className="superscript-breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Superscript Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="breakdown-icon-wrapper success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="breakdown-label">True Positives</p>
                    <p className="breakdown-value">{totalTPSuperscript}</p>
                  </div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-icon-wrapper danger">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="breakdown-label">False Positives</p>
                    <p className="breakdown-value">{totalFPSuperscript}</p>
                  </div>
                </div>
                <div className="breakdown-item">
                  <div className="breakdown-icon-wrapper warning">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="breakdown-label">False Negatives</p>
                    <p className="breakdown-value">{totalFNSuperscript}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DETAILED RESULTS TABLE */}
      <Card className="details-table-card">
        <CardHeader>
          <CardTitle>File-by-File Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-wrapper">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">File Name</TableHead>
                  <TableHead className="text-center font-semibold">Page</TableHead>
                  {isIndentationDetails ? ( // <-- UPDATED HEADERS
                    <>
                      <TableHead className="text-right font-semibold">Total Rows</TableHead>
                      <TableHead className="text-right font-semibold">Row Match %</TableHead>
                      <TableHead className="text-right font-semibold">Level Match %</TableHead> {/* ADDED */}
                      <TableHead className="text-right font-semibold">Parent Text %</TableHead> {/* ADDED */}
                      <TableHead className="text-right font-semibold">Row Data %</TableHead> {/* ADDED */}
                      <TableHead className="text-right font-semibold">GT Rows</TableHead>
                      <TableHead className="text-right font-semibold">Table Num</TableHead>
                      <TableHead className="text-center font-semibold">View Page</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-right font-semibold">Total Paragraphs</TableHead>
                      <TableHead className="text-right font-semibold">Content Matches</TableHead>
                      <TableHead className="text-right font-semibold">Content Match %</TableHead>
                      <TableHead className="text-right font-semibold">TP</TableHead>
                      <TableHead className="text-right font-semibold">FP</TableHead>
                      <TableHead className="text-right font-semibold">FN</TableHead>
                      <TableHead className="text-right font-semibold">Superscript Matches</TableHead>
                      <TableHead className="text-right font-semibold">Superscript %</TableHead>
                      <TableHead className="text-center font-semibold">View Page</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: any, index: number) => {
                  return (
                    <TableRow key={`${item.File_Name}-${item.Page_Num}-${index}`} className="table-row-hover">
                      <TableCell className="font-medium">{item.File_Name}</TableCell>
                      <TableCell className="text-center"><span className="page-badge">{item.Page_Num}</span></TableCell>

                      {isIndentationDetails ? (
                        <>
                          <TableCell className="text-right">{item.total_rows || 'N/A'}</TableCell>
                          <TableCell className={`text-right font-semibold ${getMatchColorClass(item.row_match_percentage || 0)}`}>
                            {(item.row_match_percentage || 0).toFixed(2)}%
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${getMatchColorClass(item.indentation_level_match_percentage || 0)}`}>
                            {(item.indentation_level_match_percentage || 0).toFixed(2)}%
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${getMatchColorClass(item.parent_text_match_percentage || 0)}`}>
                            {(item.parent_text_match_percentage || 0).toFixed(2)}%
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${getMatchColorClass(item.row_data_match_percentage || 0)}`}>
                            {(item.row_data_match_percentage || 0).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">{item.gt_rows || 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.Table_Num || 'N/A'}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const fileStemForApi = `${item.File_Name}${item.Table_Num ? `_table_${item.Table_Num}` : ''}`;
                                const uniqueFileIdentifier = `${fileStemForApi}_${item.Page_Num}`;
                                onViewFileDetails(uniqueFileIdentifier, runId!, Number(item.Page_Num));
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-right">{item.total_paragraphs}</TableCell>
                          <TableCell className="text-right">{item.content_matches}</TableCell>
                          <TableCell className={`text-right font-semibold ${getMatchColorClass(item.content_match_percentage)}`}>
                            {item.content_match_percentage.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            {item.TP_superscript}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">
                            {item.FP_superscript}
                          </TableCell>
                          <TableCell className="text-right text-yellow-600 dark:text-yellow-400">
                            {item.FN_superscript}
                          </TableCell>
                          <TableCell className="text-right">{item.superscript_matches}</TableCell>
                          <TableCell className={`text-right font-semibold ${getMatchColorClass(item.superscript_match_percentage)}`}>
                            {item.superscript_match_percentage.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const uniqueFileName = `${item.File_Name}_${item.Page_Num}`;
                                onViewFileDetails(uniqueFileName, runId!, 1);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}