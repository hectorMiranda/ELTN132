import { useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

interface CircuitElement {
    type: string;
    name: string;
    attributes?: Record<string, any>;
    position?: { x: number; y: number };
}

function DigViewerContent() {
    const [file, setFile] = useState<File | null>(null);
    const [circuitData, setCircuitData] = useState<CircuitElement[] | null>(null);
    const [xmlContent, setXmlContent] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (!uploadedFile) return;

        if (!uploadedFile.name.endsWith('.dig')) {
            setError('Please upload a .dig file');
            return;
        }

        setFile(uploadedFile);
        setError('');
        setLoading(true);

        try {
            const text = await uploadedFile.text();
            setXmlContent(text);
            parseDigFile(text);
        } catch (err) {
            setError('Error reading file: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const parseDigFile = (xmlText: string) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const elements: CircuitElement[] = [];
            const visualElements = xmlDoc.getElementsByTagName('visualElement');

            for (let i = 0; i < visualElements.length; i++) {
                const element = visualElements[i];
                const elementName = element.getElementsByTagName('elementName')[0]?.textContent || 'Unknown';
                const attributes = element.getElementsByTagName('elementAttributes')[0];
                
                const posElement = element.getElementsByTagName('pos')[0];
                let position = { x: 0, y: 0 };
                if (posElement) {
                    position = {
                        x: parseInt(posElement.getAttribute('x') || '0'),
                        y: parseInt(posElement.getAttribute('y') || '0')
                    };
                }

                const attrs: Record<string, any> = {};
                if (attributes) {
                    const entries = attributes.getElementsByTagName('entry');
                    for (let j = 0; j < entries.length; j++) {
                        const entry = entries[j];
                        const key = entry.getElementsByTagName('string')[0]?.textContent || '';
                        const value = entry.getElementsByTagName('string')[1]?.textContent || 
                                    entry.getElementsByTagName('int')[0]?.textContent ||
                                    entry.getElementsByTagName('boolean')[0]?.textContent || '';
                        if (key) attrs[key] = value;
                    }
                }

                elements.push({
                    type: elementName,
                    name: attrs['Label'] || elementName,
                    attributes: attrs,
                    position
                });
            }

            setCircuitData(elements);
        } catch (err) {
            setError('Error parsing .dig file: ' + (err as Error).message);
        }
    };

    const loadExampleFile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/digital-lock.dig');
            const text = await response.text();
            setXmlContent(text);
            parseDigFile(text);
            setFile(new File([text], 'digital-lock.dig', { type: 'text/xml' }));
        } catch (err) {
            setError('Error loading example file: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const renderCircuitVisual = () => {
        if (!circuitData || circuitData.length === 0) return null;

        // Group elements by type
        const grouped: Record<string, CircuitElement[]> = {};
        circuitData.forEach(el => {
            if (!grouped[el.type]) grouped[el.type] = [];
            grouped[el.type].push(el);
        });

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                {Object.entries(grouped).map(([type, elements]) => (
                    <div key={type} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {type} <span className="text-sm font-normal text-slate-500">({elements.length})</span>
                        </h3>
                        <div className="space-y-2">
                            {elements.map((el, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border border-slate-100 hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">{el.name}</p>
                                            {el.position && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Position: ({el.position.x}, {el.position.y})
                                                </p>
                                            )}
                                        </div>
                                        {el.attributes && Object.keys(el.attributes).length > 0 && (
                                            <div className="text-xs text-blue-600 font-mono ml-2">
                                                {Object.keys(el.attributes).length} attrs
                                            </div>
                                        )}
                                    </div>
                                    {el.attributes && Object.entries(el.attributes).slice(0, 3).map(([key, val]) => (
                                        <div key={key} className="text-xs text-slate-600 mt-1 flex gap-2">
                                            <span className="font-medium">{key}:</span>
                                            <span className="truncate">{String(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Digital Circuit Viewer
                </h1>
                <p className="text-slate-600">
                    Upload and analyze <code className="bg-slate-100 px-2 py-1 rounded text-sm">.dig</code> files from Digital Logic Simulator
                </p>
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* File Upload */}
                <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8 hover:border-blue-400 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".dig"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Circuit File</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Drag and drop your .dig file or click to browse
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                        >
                            Choose File
                        </button>
                        {file && (
                            <p className="mt-4 text-sm text-green-600 font-medium">
                                ✓ Loaded: {file.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Load Example */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-8">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-indigo-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-lg font-semibold text-indigo-900 mb-2">Try Example Circuit</h3>
                        <p className="text-sm text-indigo-700 mb-4">
                            Load the digital lock circuit example
                        </p>
                        <button
                            onClick={loadExampleFile}
                            disabled={loading}
                            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Load Example'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Circuit Information */}
            {circuitData && (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="text-3xl font-bold text-blue-600">{circuitData.length}</div>
                            <div className="text-sm text-blue-700 mt-1">Total Elements</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="text-3xl font-bold text-purple-600">
                                {new Set(circuitData.map(el => el.type)).size}
                            </div>
                            <div className="text-sm text-purple-700 mt-1">Unique Types</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="text-3xl font-bold text-green-600">
                                {circuitData.filter(el => el.type.includes('Button')).length}
                            </div>
                            <div className="text-sm text-green-700 mt-1">Inputs</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <div className="text-3xl font-bold text-orange-600">
                                {circuitData.filter(el => el.type.includes('LED')).length}
                            </div>
                            <div className="text-sm text-orange-700 mt-1">Outputs</div>
                        </div>
                    </div>

                    {/* Circuit Components */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Circuit Components</h2>
                        </div>
                        {renderCircuitVisual()}
                    </div>

                    {/* Raw XML Viewer (Collapsible) */}
                    <details className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        <summary className="px-6 py-4 cursor-pointer font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                            View Raw XML Content
                        </summary>
                        <div className="px-6 py-4 bg-slate-900 text-green-400 font-mono text-sm overflow-x-auto">
                            <pre className="whitespace-pre-wrap break-words">{xmlContent}</pre>
                        </div>
                    </details>
                </div>
            )}

            {/* Info Card */}
            {!circuitData && !error && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2">About Digital Circuit Files</h3>
                            <p className="text-blue-800 mb-2">
                                This viewer supports <strong>.dig</strong> files created by the Digital Logic Simulator.
                            </p>
                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                <li>Upload your own circuit design files</li>
                                <li>View component breakdown and statistics</li>
                                <li>Analyze circuit structure and connections</li>
                                <li>Load the example digital lock circuit</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function DigViewer() {
    return (
        <ProtectedRoute>
            <DigViewerContent />
        </ProtectedRoute>
    );
}