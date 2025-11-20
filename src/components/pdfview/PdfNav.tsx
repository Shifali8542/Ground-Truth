import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import './PdfNav.scss';

interface PdfNavProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
}

const PdfNav: React.FC<PdfNavProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onDownload
}) => {
  return (
    <div className="pdf-nav-header">
      {/* Left: Page navigation */}
      <div className="pdf-nav-left">
        <Button variant="outline" size="sm" onClick={onPrevPage} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNextPage} disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: Zoom Controls */}
      <div className="pdf-nav-center">
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="zoom-info">{Math.round(zoomLevel * 100)}%</span>
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: Download */}
      <div className="pdf-nav-right">
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PdfNav;
