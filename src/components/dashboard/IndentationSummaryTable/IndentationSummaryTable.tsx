import { motion } from 'framer-motion';
import { Card, CardContent, CardTitle, CardHeader } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import type { IndentationSummaryData } from '../../../types';
import { formatRunDateTime } from '../../../lib/utils';
import './IndentationSummaryTable.scss';

interface IndentationSummaryTableProps {
    runs: IndentationSummaryData[];
}

export function IndentationSummaryTable({ runs }: IndentationSummaryTableProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="indentation-summary-table"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Indentation Results Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Date & Time</TableHead>
                                <TableHead>Changes Description</TableHead>
                                <TableHead className="text-right">Files Processed</TableHead>
                                <TableHead className="text-right">Total Rows</TableHead>
                                <TableHead className="text-right">Row Match %</TableHead>
                                <TableHead className="text-right">Level Match %</TableHead>
                                <TableHead className="text-right">Parent Text Match %</TableHead>
                                <TableHead className="text-right">Row Data Match %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {runs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        No indentation summary results available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                runs.map((run, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
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
                                        <TableCell className="text-right">{run.total_rows}</TableCell>
                                        <TableCell className="text-right">{run.row_match_percentage.toFixed(2)}%</TableCell>
                                        <TableCell className="text-right">{run.indentation_level_match_percentage.toFixed(2)}%</TableCell>
                                        <TableCell className="text-right">{run.parent_text_match_percentage.toFixed(2)}%</TableCell>
                                        <TableCell className="text-right">{run.row_data_match_percentage.toFixed(2)}%</TableCell>
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