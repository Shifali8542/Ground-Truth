import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ChevronLeft, FileText, FileJson, FileType2, Save, Eye, EyeOff, Settings2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Checkbox } from '../../ui/checkbox';
import './ViewPage.scss';
import PdfNav from '../../pdfview/PdfNav';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


// Define a type for the data structure expected from the backend for the 3-way view
interface ThreeWayViewData {
  File_Name: string;
  Page_Num: string;
  comparison_data: any[];
  pdf_view_base64: string;
  html_view_content: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    prevFile: string | null;
    nextFile: string | null;
  }
  Run_Id?: string;
}

interface FileThreeWayViewProps {
  data: ThreeWayViewData;
  onClose: () => void;
  onPageChange: (newPage: number) => void;
  onSave: (updatedData: ThreeWayViewData) => void;
}

// Helper function to format values for display
const formatValue = (key: string, value: any) => {
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  if (key.includes('content') && typeof value === 'string') {
    return value.length > 80 ? value.substring(0, 77) + '...' : value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString();
};

// Editable Checkbox for Match Status
interface MatchCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const MatchCheckbox = ({ id, checked, onCheckedChange }: MatchCheckboxProps) => {
  return (
    <div className="flex justify-center items-center h-full">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "w-5 h-5 transition-colors duration-100",
          checked ? "border-green-600 bg-green-600 text-white" : "border-gray-400 bg-transparent text-transparent"
        )}
      />
    </div>
  );
};

// Component for the Detailed JSON GT Comparison Table
const JsonGTTable = ({ data, onMatchChange }: { data: any[], onMatchChange: (rowIndex: number, matchKey: string, isChecked: boolean) => void }) => {
  const columnDefs = [
    { key: 'content', outputKey: 'content_output', gtKey: 'content_gt', matchKey: 'content_match', header: 'Content' },
    { key: 'superscript', outputKey: 'superscript_output', gtKey: 'superscript_in_gt', matchKey: 'superscript_match', header: 'Superscript' },
    { key: 'font_size', outputKey: 'font_size_output', gtKey: 'font_size_gt', matchKey: 'font_size_match', header: 'Font Size' },
    { key: 'font_style', outputKey: 'font_style_output', gtKey: 'font_style_gt', matchKey: 'font_style_match', header: 'Font Style' },
    { key: 'font_color', outputKey: 'font_color_output', gtKey: 'font_color_gt', matchKey: 'font_color_match', header: 'Font Color' },
    { key: 'font_name', outputKey: 'font_name_output', gtKey: 'font_name_gt', matchKey: 'font_name_match', header: 'Font Name' },
  ];

  const renderHeader = () => (
    <TableRow>
      <TableHead className="w-[50px] text-center font-bold">#</TableHead>
      {columnDefs.map(col => (
        <React.Fragment key={col.key}>
          <TableHead className="w-[180px] md:w-[200px] text-center font-bold">{col.header} (Output)</TableHead>
          <TableHead className="w-[180px] md:w-[200px] text-center font-bold">{col.header} (GT)</TableHead>
          <TableHead className="w-[60px] text-center font-bold">{col.header} Match</TableHead>
        </React.Fragment>
      ))}
    </TableRow>
  );

  const renderRow = (item: any, index: number) => (
    <TableRow key={index} className="comparison-row">
      <TableCell className="row-index font-bold text-center">{index + 1}</TableCell>
      {columnDefs.map(col => {
        const outputValue = item[col.outputKey];
        const gtValue = item[col.gtKey];
        const match = item[col.matchKey] ?? false;

        return (
          <React.Fragment key={col.key}>
            <TableCell className="output-cell text-xs" title={outputValue}>
              {formatValue(col.key, outputValue)}
            </TableCell>
            {col.key === 'superscript' ? (
              <TableCell className="gt-cell text-center p-1">
                <div className="match-box">
                  <MatchCheckbox
                    id={`row-${index}-${col.gtKey}-readonly`}
                    checked={!!gtValue} // Use !! to ensure boolean conversion
                    onCheckedChange={() => { }} // Make it read-only
                  />
                </div>
              </TableCell>
            ) : (
              <TableCell className="gt-cell text-xs" title={gtValue}>
                {formatValue(col.key, gtValue)}
              </TableCell>
            )}
            {/* Individual Property Match Status Cell (Checkbox) */}
            <TableCell className="match-status-cell text-center p-1">
              <div className="match-box">
                <MatchCheckbox
                  id={`row-${index}-${col.matchKey}`}
                  checked={match}
                  onCheckedChange={(isChecked) => onMatchChange(index, col.matchKey, isChecked)}
                />
              </div>
            </TableCell>
          </React.Fragment>
        );
      })}
    </TableRow>
  );

  return (
    <div className="table-wrapper overflow-auto">
      <Table>
        <TableHeader>
          {renderHeader()}
        </TableHeader>
        <TableBody>
          {data.map(renderRow)}
        </TableBody>
      </Table>
    </div>
  );
};

export function FileThreeWayView({ data, onClose, onPageChange, onSave }: FileThreeWayViewProps) {
  const currentPage = data.pagination.currentPage || 1;
  const totalPages = data.pagination.totalPages || 1;
  const [showJson, setShowJson] = useState(true);
  const [showPdf, setShowPdf] = useState(true);
  const [showHtml, setShowHtml] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const viewControlsRef = useRef<HTMLDivElement>(null);
  const [comparisonData, setComparisonData] = useState(data.comparison_data);
  const [hasChanges, setHasChanges] = useState(false);
  const fileName = data.File_Name || 'File Details';

  // ADDED: Logic to close view controls when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewControlsRef.current && !viewControlsRef.current.contains(event.target as Node)) {
        setShowControls(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [viewControlsRef]);

  // Update local state when external 'data' prop changes
  useEffect(() => {
    setComparisonData(data.comparison_data);
    setHasChanges(false);
  }, [data.comparison_data, data.Page_Num, data.pagination.currentPage]);

  // Logic to close view controls when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewControlsRef.current && !viewControlsRef.current.contains(event.target as Node)) {
        setShowControls(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [viewControlsRef]);


  // Handler to update the match status in the local state
  const handleMatchChange = useCallback((rowIndex: number, matchKey: string, isChecked: boolean) => {
    setComparisonData(prevData => {
      const newData = [...prevData];
      if (newData[rowIndex]) {
        newData[rowIndex] = {
          ...newData[rowIndex],
          [matchKey]: isChecked
        };
        setHasChanges(true);
        return newData;
      }
      return prevData;
    });
  }, [])

  const handlePageChange = (delta: number) => {
    // Optionally alert/warn user if unsaved changes exist
    if (hasChanges && !window.confirm("You have unsaved changes. Do you want to discard them and proceed?")) {
      return;
    }
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handleSave = () => {
    const updatedData: ThreeWayViewData = {
      ...data,
      comparison_data: comparisonData,
      Run_Id: data.Run_Id
    };
    onSave(updatedData);
    setHasChanges(false);
  };

  // Custom component for the JSON display area
  const JsonDisplay = ({ content, onMatchChange }: { content: any[], onMatchChange: (rowIndex: number, matchKey: string, isChecked: boolean) => void }) => (
    <Card className="json-view-card overflow-x-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className='flex items-center space-x-2'>
          <FileJson className="h-4 w-4 text-orange-500" />
          <CardTitle className="text-sm font-medium">Ground Truth Result</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0 flex flex-col flex-grow">
        <JsonGTTable data={content} onMatchChange={onMatchChange} />
      </CardContent>
    </Card>
  );

  // Custom component for the PDF display area (No changes needed)
 const PdfDisplay = ({ base64 }: { base64: string }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = 'document.pdf';
    link.click();
  };

  const pdfData = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

  return (
    <Card className="pdf-view-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileType2 className="h-4 w-4 text-red-500" />
          <CardTitle className="text-sm font-medium">PDF Page View</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        {/* ✅ PDF Navbar Header */}
        <PdfNav
          currentPage={pageNumber}
          totalPages={numPages || 1}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          zoomLevel={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onDownload={handleDownload}
        />

        {/* ✅ PDF Viewer */}
        <div className="pdf-viewer overflow-auto flex justify-center bg-gray-50 p-2">
          <Document file={{ data: pdfData }} onLoadSuccess={handleLoadSuccess}>
            <Page pageNumber={pageNumber} scale={zoom} width={500 * zoom} />
          </Document>
        </div>
      </CardContent>
    </Card>
  );
};



  // Custom component for the HTML display area (No changes needed)
  const HtmlDisplay = ({ htmlContent }: { htmlContent: string }) => (
    <Card className="html-view-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className='flex items-center space-x-2'>
          <FileType2 className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm font-medium">HTML Page </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="html-viewer" style={{ overflow: 'auto' }}>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </CardContent>
    </Card>
  );

  // Determine grid template columns based on visibility
  const visibleViews = [showJson, showPdf, showHtml].filter(v => v);
  const columnCount = visibleViews.length;
  // Use CSS grid fractional units (fr) for equal distribution
  const gridTemplate = columnCount > 0 ? visibleViews.map(() => '1fr').join(' ') : '1fr';


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="file-three-way-view"
    >
      {/* HEADER and Controls */}
      <div className="detail-header">
        <div className="header-content">
          <div className="header-title-section">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h2 className="header-title">File Comparison Viewer</h2>
              <p className="header-subtitle truncate">{fileName} (Page {currentPage})</p>
            </div>
          </div>

          {/* <div className="controls-section"> */}
            {/* Page Navigation */}
            <div className="page-navigation flex items-center space-x-2 mr-4">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(-1)}
                disabled={currentPage <= 1}
              >
                Prev Page
              </Button> */}
              <span className="text-sm font-medium whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage >= totalPages}
              >
                Next Page
              </Button> */}
            {/* </div> */}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              variant={hasChanges ? "default" : "secondary"}
              size="lg"
              className="mr-2"
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" /> {hasChanges ? 'Save Changes *' : 'Changes Saved'}
            </Button>

            {/* Centralized Visibility Control Button */}
            <div className="relative" ref={viewControlsRef}>
              <Button
                onClick={() => setShowControls(!showControls)}
                variant="outline"
                size="lg"
                className="mr-2"
              >
                <Settings2 className="h-4 w-4 mr-2" /> View
              </Button>
              {/* Simple dropdown menu representation */}
              {showControls && (
                <div className="absolute right-0 top-12 z-50 w-48 bg-card border border-border rounded-md shadow-lg p-2 flex flex-col space-y-1">
                  <Button variant="ghost" size="sm" onClick={() => { setShowJson(!showJson); setShowControls(false); }} className="justify-start">
                    {showJson ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showJson ? 'Hide GT Table' : 'Show GT Table'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowPdf(!showPdf); setShowControls(false); }} className="justify-start">
                    {showPdf ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPdf ? 'Hide PDF View' : 'Show PDF View'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowHtml(!showHtml); setShowControls(false); }} className="justify-start">
                    {showHtml ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showHtml ? 'Hide HTML View' : 'Show HTML View'}
                  </Button>
                </div>
              )}
            </div>

            {/* Back Button */}
            <Button onClick={onClose} variant="outline" size="lg">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Results
            </Button>
          </div>
        </div>
      </div>

      {/* Main Comparison Area */}
      <div className="comparison-grid" style={{ gridTemplateColumns: gridTemplate }}>
        {showJson && <JsonDisplay content={comparisonData} onMatchChange={handleMatchChange} />}
        {showHtml && <HtmlDisplay htmlContent={data.html_view_content} />}
        {showPdf && <PdfDisplay base64={data.pdf_view_base64} />}
      </div>
    </motion.div>
  );
}