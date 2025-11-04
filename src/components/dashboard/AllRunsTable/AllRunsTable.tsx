import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '../../ui/table';
import type { ComparisonRun } from '../../../types';
import { formatRunDateTime } from '../../../lib/utils'; 
import './AllRunsTable.scss';

interface AllRunsTableProps {
  runs: ComparisonRun[];
  onRunClick: (runId: string) => void;
}

export function AllRunsTable({ runs, onRunClick }: AllRunsTableProps) {
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
