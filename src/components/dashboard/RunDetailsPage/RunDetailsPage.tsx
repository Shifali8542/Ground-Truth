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
}

export function RunDetailsPage({ data, runId, onGoBack, state }: RunDetailsPageProps) {
  if (!runId || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="empty-details-state"
      >
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">No detailed data found for this run.</p>
        <Button onClick={onGoBack} variant="outline" className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Summary
        </Button>
      </motion.div>
    );
  }

  // Calculate high-level summary metadata
  const totalFiles = data.length;
  const totalParagraphs = data.reduce((sum, item) => sum + item.total_paragraphs, 0);
  const totalMatches = data.reduce((sum, item) => sum + item.content_matches, 0);
  const totalTPSuperscript = data.reduce((sum, item) => sum + item.TP_superscript, 0);
  const totalFPSuperscript = data.reduce((sum, item) => sum + item.FP_superscript, 0);
  const totalFNSuperscript = data.reduce((sum, item) => sum + item.FN_superscript, 0);
  const totalSuperscriptMatches = data.reduce((sum, item) => sum + item.superscript_matches, 0);
  
  const contentMatchOverall = totalParagraphs > 0 ? (totalMatches / totalParagraphs) * 100 : 0;
  const superscriptMatchOverall = totalParagraphs > 0 ? (totalSuperscriptMatches / totalParagraphs) * 100 : 0;

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
              <h2 className="header-title">Run Details</h2>
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
      </div>

      {/* SUPERSCRIPT BREAKDOWN */}
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
                  <TableHead className="text-right font-semibold">Total Paragraphs</TableHead>
                  <TableHead className="text-right font-semibold">Content Matches</TableHead>
                  <TableHead className="text-right font-semibold">Content Match %</TableHead>
                  <TableHead className="text-right font-semibold">TP</TableHead>
                  <TableHead className="text-right font-semibold">FP</TableHead>
                  <TableHead className="text-right font-semibold">FN</TableHead>
                  <TableHead className="text-right font-semibold">Superscript Matches</TableHead>
                  <TableHead className="text-right font-semibold">Superscript %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={`${item.File_Name}-${item.Page_Num}-${index}`} className="table-row-hover">
                    <TableCell className="font-medium">{item.File_Name}</TableCell>
                    <TableCell className="text-center">
                      <span className="page-badge">{item.Page_Num}</span>
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}