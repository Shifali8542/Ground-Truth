# Ground Truth (GT) Comparison Dashboard

A responsive, production-ready React dashboard for comparing Ground Truth JSON files with Output JSON files. Features a two-column layout with a control sidebar and a main content area for displaying detailed comparison results.

## Features

- **Two-Column Layout**: Fixed sidebar for controls, flexible main content area
- **File Upload**: Upload ZIP folders containing Ground Truth and Output JSON files
- **Multiple Views**:
  - Final Summary Results (all runs)
  - Run Summary (selected run details)
  - Individual File Diff (side-by-side comparison)
- **Dynamic Filtering**: Filter by run, file name, and page number
- **Column Toggle**: View all columns, superscript results only, or font info results only
- **Theme Support**: Light and dark mode with smooth transitions
- **Responsive Design**: Optimized for various screen sizes

## Technology Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Sass (SCSS) - No CSS modules
- **UI Components**: shadcn/ui (Card, Table, Accordion, Button, Checkbox, RadioGroup, Dialog, DropdownMenu)
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
src/
├── api.ts                           # API layer for backend communication
├── types/
│   └── index.ts                     # TypeScript type definitions
├── lib/
│   └── utils.ts                     # Utility functions
├── components/
│   ├── theme-provider.tsx           # Theme context provider
│   ├── ui/                          # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── radio-group.tsx
│   │   ├── input.tsx
│   │   ├── accordion.tsx
│   │   └── label.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx              # Left sidebar with controls
│   │   ├── Sidebar.scss
│   │   ├── MainContent.tsx          # Main content area
│   │   └── MainContent.scss
│   └── dashboard/
│       ├── AllRunsTable/            # All runs summary table
│       │   ├── AllRunsTable.tsx
│       │   └── AllRunsTable.scss
│       ├── RunSummaryTable/         # Selected run details table
│       │   ├── RunSummaryTable.tsx
│       │   └── RunSummaryTable.scss
│       └── FileDiffView/            # Side-by-side file diff view
│           ├── FileDiffView.tsx
│           └── FileDiffView.scss
├── App.tsx                          # Main application component
└── main.tsx                         # Application entry point
```

## API Endpoints

The application expects the following backend API endpoints:

### 1. Run New Comparison
```
POST /api/comparison/run
Content-Type: multipart/form-data

Body:
- gt_zip: File (Ground Truth ZIP)
- running_zip: File (Output ZIP)

Response:
{
  "runId": "2025-10-28_10-25-50"
}
```

### 2. Fetch All Runs
```
GET /api/comparison/runs

Response:
[
  {
    "id": "2025-10-28_10-25-50",
    "date_time": "2025-10-28 10:25:50",
    "changes_description": "Initial comparison",
    "no_of_files_processed": 10,
    "total_paragraphs": 150,
    "content_matches": 145
  }
]
```

### 3. Fetch Run Details
```
GET /api/comparison/runs/:runId/details

Response:
[
  {
    "file_name": "document1",
    "page_num": 1,
    "total_paragraphs": 15,
    "content_matches": 14,
    "content_match_percentage": 93.33,
    "tp_superscript": 5,
    "fp_superscript": 1,
    "fn_superscript": 0,
    "tp_font_info": 10,
    "fp_font_info": 2,
    "fn_font_info": 1
  }
]
```

### 4. Fetch File Diff
```
GET /api/comparison/runs/:runId/diff?fileName=document1&suffix=1

Response:
[
  {
    "index": 1,
    "content_output": "This is a <sup>superscript</sup> example",
    "content_gt": "This is a <sup>superscript</sup> example"
  }
]
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Key Features Explained

### Sidebar Controls

- **Start New Comparison**: Opens a dialog to upload Ground Truth and Output ZIP files
- **Display Options**: Toggle visibility of different views
- **Column Selection**: Choose which columns to display in the Run Summary table
- **Data Selectors**: Navigate through runs, files, and pages

### Main Content Area

Conditionally displays three types of content based on sidebar selections:

1. **All Runs Table**: Shows a summary of all comparison runs
2. **Run Summary Table**: Displays file-level details for the selected run
3. **File Diff View**: Shows side-by-side comparison of output vs ground truth content

### Theme Support

Toggle between light and dark modes using the moon/sun icon in the sidebar header. Theme preference is persisted in localStorage.

### HTML Content Rendering

The File Diff View safely renders HTML content (like `<sup>` tags) using React's `dangerouslySetInnerHTML`. Matching rows are highlighted in green, mismatches in red.

## Component Architecture

Each component follows the single responsibility principle with its own dedicated SCSS file. No CSS modules are used - all styling is done through regular SCSS files imported into their respective components.

## Type Safety

Full TypeScript support with strict type checking. All API responses and component props are properly typed.

## Animation

Framer Motion is used for smooth transitions when components enter/exit the DOM and for theme transitions.
