import * as React from 'react';
import type { ComparisonRun, SidebarState } from '../../../types';
import { Label } from '../../ui/label';
import { fetchTableCellsFileNames } from '../../../api';
import './GT.scss';

// Mock function for JSON viewing (You'll need a real API call here)
const mockFetchRunJson = async (runId: string) => {
    // Simulate fetching JSON data for the run
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        runId: runId,
        timestamp: runId,
        metadata: {
            description: `Data for run ${runId}`,
            files_processed: 100,
        },
        results_summary: {
            content_match_percentage: Math.floor(Math.random() * 100),
            superscript_match_percentage: Math.floor(Math.random() * 100),
        },
        // ... a lot more data
    };
};

interface GTProps {
    allRuns: ComparisonRun[];
    state: SidebarState;
}

export function GT({ allRuns, state }: GTProps) {
    const [selectedRunId, setSelectedRunId] = React.useState<string | null>(allRuns[0]?.Date_Time || null);
    const [runJsonData, setRunJsonData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [fileNames, setFileNames] = React.useState<string[]>([]);
    const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);
    const [isFilesLoading, setIsFilesLoading] = React.useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    React.useEffect(() => {
        if (selectedRunId) {
            setIsLoading(true);
            mockFetchRunJson(selectedRunId)
                .then(setRunJsonData)
                .catch(error => {
                    console.error('Failed to fetch run JSON:', error);
                    setRunJsonData({ error: 'Failed to load run data.' });
                })
                .finally(() => setIsLoading(false));
        } else {
            setRunJsonData(null);
        }
    }, [selectedRunId]);

    React.useEffect(() => {
        async function loadFiles() {
            setIsFilesLoading(true);
            try {
                const files = await fetchTableCellsFileNames();
                setFileNames(files);
                if (files.length > 0) {
                    setSelectedFileName(files[0]); // Select the first file by default
                }
            } catch (error) {
                console.error('Failed to load file names for JSON viewer:', error);
            } finally {
                setIsFilesLoading(false);
            }
        }
        loadFiles();
    }, []);

    const handleRunChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRunId(event.target.value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFileName(event.target.value);
    };

    const handleSelectFile = (file: string) => {
        setSelectedFileName(file);
        setIsDropdownOpen(false);
    };

    return (
        <div className="gt-page">
            <div className="gt-header">
                <div className="gt-dropdown-container">
                    {/* The label is part of the custom select visually now */}
                    <div className="custom-select-container"> 
                        <div 
                            className="select-display-box"
                            onClick={() => setIsDropdownOpen(prev => !prev)}
                        >
                            <span className="select-data-label">Select Data</span>
                            <span className="select-value-text">
                                {/* Display the selected file or the default placeholder text */}
                                {selectedFileName 
                                    ? selectedFileName
                                    : "Please choose file for validation"
                                }
                            </span>
                        </div>

                        {/* Dropdown Menu (only visible when isDropdownOpen is true) */}
                        {isDropdownOpen && (
                            <div className="select-dropdown-menu">
                                {/* REMOVED: Search Input */}
                                {/* REMOVED: <input ... /> */}

                                {/* File List */}
                                <div className="file-list-scroll">
                                    {isFilesLoading ? (
                                        <div className="list-item loading">Loading files...</div>
                                    ) : fileNames.length === 0 ? ( // <-- USE fileNames directly
                                        <div className="list-item empty">No files available.</div> // <-- Simplified empty text
                                    ) : (
                                        fileNames.map(file => ( 
                                            <div
                                                key={file}
                                                className={`list-item ${file === selectedFileName ? 'selected' : ''}`}
                                                onClick={() => handleSelectFile(file)}
                                            >
                                                <div className="file-name">{file}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <h2 className="gt-title">JSON Run Results Viewer</h2>
            </div>
        </div>
    );
}