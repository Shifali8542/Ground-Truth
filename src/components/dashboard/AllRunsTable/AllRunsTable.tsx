import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '../../ui/table';
import type { ComparisonRun } from '../../../types';
import { formatRunDateTime } from '../../../lib/utils'; 
import './AllRunsTable.scss';

interface AllRunsTableProps {
  runs: ComparisonRun[];
  onRunClick: (runId: string) => void;
  onRunDelete: (runId: string) => void;
}

export function AllRunsTable({ runs, onRunClick, onRunDelete }: AllRunsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="all-runs-table"
    >
      <Card>
        <CardHeader>
          <CardTitle>Final Summary Results (All Runs)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Changes Description</TableHead>
                <TableHead className="text-right">Files Processed</TableHead>
                <TableHead className="text-right">Total Paragraphs</TableHead>
                <TableHead className="text-right">Content Matches</TableHead>
                <TableHead className="text-right">Content Match %</TableHead>
                <TableHead className="text-right">TP Superscript</TableHead>
                <TableHead className="text-right">FN Superscript</TableHead>
                <TableHead className="text-right">FP Superscript</TableHead>
                <TableHead className="text-right">Superscript Matches</TableHead>
                <TableHead className="text-right">Superscript Match %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No runs available. Start a new comparison to see results.
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow key={run.Date_Time}>
                    <TableCell 
                      className="w-[180px] cursor-pointer hover:bg-muted/70"
                      onClick={() => onRunClick(run.Date_Time)}
                    >
                      <div className="flex flex-col items-start space-y-0.5">
                        <span className="font-semibold text-primary">
                          {formatRunDateTime(run.Date_Time).split(' at ')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRunDateTime(run.Date_Time).split(' at ')[1]}
                        </span>
                      </div>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent onRunClick from firing
                          onRunDelete(run.Date_Time);
                        }}
                        aria-label={`Delete run from ${formatRunDateTime(run.Date_Time)}`}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </TableCell>
                    <TableCell>{run.Changes_Description}</TableCell>
                    <TableCell className="text-right">{run.No_of_Files_Processed}</TableCell>
                    <TableCell className="text-right">{run.total_paragraphs}</TableCell>
                    <TableCell className="text-right">{run.content_matches}</TableCell>
                    <TableCell className="text-right">{run.content_match_percentage.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{run.TP_superscript}</TableCell>
                    <TableCell className="text-right">{run.FN_superscript}</TableCell>
                    <TableCell className="text-right">{run.FP_superscript}</TableCell>
                    <TableCell className="text-right">{run.superscript_matches}</TableCell>
                    <TableCell className="text-right">{run.superscript_match_percentage.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
