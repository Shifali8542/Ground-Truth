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
import type { FileDiffRow } from '../../../types';
import './FileDiffView.scss';

interface FileDiffViewProps {
  diffData: FileDiffRow[];
  fileName: string;
  fileSuffix: string;
  runId: string;
}

export function FileDiffView({ diffData, fileName, fileSuffix, runId }: FileDiffViewProps) {
  const renderHtmlContent = (content: string) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="file-diff-view"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            Detailed Results: {runId}/{fileName}_{fileSuffix}.json
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Index</TableHead>
                <TableHead className="w-1/2">Content Output</TableHead>
                <TableHead className="w-1/2">Content GT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diffData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No diff data available for this file.
                  </TableCell>
                </TableRow>
              ) : (
                diffData.map((row) => {
                  const isMatch = row.content_output === row.content_gt;
                  return (
                    <TableRow key={row.index} className={isMatch ? 'match' : 'mismatch'}>
                      <TableCell className="font-medium">{row.index}</TableCell>
                      <TableCell className="content-cell">
                        {renderHtmlContent(row.content_output)}
                      </TableCell>
                      <TableCell className="content-cell">
                        {renderHtmlContent(row.content_gt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
