import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import type { FileResult } from '../../../types';
import './RunSummaryTable.scss';

interface RunSummaryTableProps {
  results: FileResult[];
  columnToggle: 'all' | 'superscript' | 'font_info';
}

export function RunSummaryTable({ results, columnToggle }: RunSummaryTableProps) {
  const showAll = columnToggle === 'all';
  const showSuperscript = columnToggle === 'all' || columnToggle === 'superscript';
  const showFontInfo = columnToggle === 'all' || columnToggle === 'font_info';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="run-summary-table"
    >
      <Card>
        <CardHeader>
          <CardTitle>Summary for Selected Run</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="text-right">Page</TableHead>
                <TableHead className="text-right">Total Paragraphs</TableHead>
                <TableHead className="text-right">Content Matches</TableHead>
                <TableHead className="text-right">Match %</TableHead>
                {showSuperscript && (
                  <>
                    <TableHead className="text-right">TP Superscript</TableHead>
                    <TableHead className="text-right">FP Superscript</TableHead>
                    <TableHead className="text-right">FN Superscript</TableHead>
                  </>
                )}
                {showFontInfo && (
                  <>
                    <TableHead className="text-right">TP Font Info</TableHead>
                    <TableHead className="text-right">FP Font Info</TableHead>
                    <TableHead className="text-right">FN Font Info</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground">
                    No results available for this run.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={`${result.file_name}-${result.page_num}-${index}`}>
                    <TableCell className="font-medium">{result.file_name}</TableCell>
                    <TableCell className="text-right">{result.page_num}</TableCell>
                    <TableCell className="text-right">{result.total_paragraphs}</TableCell>
                    <TableCell className="text-right">{result.content_matches}</TableCell>
                    <TableCell className="text-right">
                      {result.content_match_percentage.toFixed(2)}%
                    </TableCell>
                    {showSuperscript && (
                      <>
                        <TableCell className="text-right">{result.tp_superscript}</TableCell>
                        <TableCell className="text-right">{result.fp_superscript}</TableCell>
                        <TableCell className="text-right">{result.fn_superscript}</TableCell>
                      </>
                    )}
                    {showFontInfo && (
                      <>
                        <TableCell className="text-right">{result.tp_font_info}</TableCell>
                        <TableCell className="text-right">{result.fp_font_info}</TableCell>
                        <TableCell className="text-right">{result.fn_font_info}</TableCell>
                      </>
                    )}
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
