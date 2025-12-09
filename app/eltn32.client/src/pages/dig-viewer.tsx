import { useState, useRef, useEffect, useMemo } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

// --- Types ---
interface Point { x: number; y: number; }
interface Wire { p1: Point; p2: Point; }
interface Component {
    type: string;
    attributes: Record<string, any>;
    pos: Point;
    rotation: number;
    label: string;
    description: string;
}
interface CircuitBounds { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number; }

interface AIAnalysisResult {
    summary: string;
    suggestions: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
}

// --- Drawing Constants ---
const COLORS = {
    WIRE: '#0000AA',
    COMPONENT_BODY: '#FFFFFF',
    COMPONENT_STROKE: '#000000',
    TEXT: '#000000',
    TUNNEL_FILL: '#FFFFFF',
    TUNNEL_STROKE: '#800080',
    PIN: '#0000AA',
    LED_OFF: '#CCCCCC',
    LED_ON: '#FF0000',
    CANVAS_BG: '#E5E5E5',
};

// IC Configuration: dimensions and colors by type
interface ICConfig {
    width: number;
    height: number;
    color: string;
}

const IC_CONFIG: Record<string, ICConfig> = {
    // Counters - Purple/Violet
    '74193': { width: 160, height: 280, color: '#DDA0DD' },
    '74192': { width: 160, height: 280, color: '#DDA0DD' },
    '74190': { width: 160, height: 280, color: '#DDA0DD' },
    '74191': { width: 160, height: 280, color: '#DDA0DD' },
    '4040': { width: 160, height: 280, color: '#DDA0DD' },
    '4060': { width: 160, height: 280, color: '#DDA0DD' },
    
    // Flip-Flops - Light Blue
    '7474': { width: 120, height: 240, color: '#87CEEB' },
    '7475': { width: 120, height: 240, color: '#87CEEB' },
    '7476': { width: 120, height: 240, color: '#87CEEB' },
    
    // Decoders/Drivers - Light Green
    '7442': { width: 140, height: 280, color: '#90EE90' },
    '7447': { width: 140, height: 240, color: '#90EE90' },
    '7485': { width: 120, height: 240, color: '#90EE90' },
    
    // Inverters - Light Coral
    '7404': { width: 120, height: 240, color: '#F08080' },
    
    // AND Gates - Light Yellow
    '7408': { width: 120, height: 240, color: '#FFFFE0' },
    
    // OR Gates - Peach
    '7432': { width: 120, height: 240, color: '#FFDAB9' },
    
    // NAND Gates - Light Pink
    '7400': { width: 120, height: 240, color: '#FFB6C1' },
    
    // NOR Gates - Lavender
    '7402': { width: 120, height: 240, color: '#E6E6FA' },
    
    // XOR Gates - Light Cyan
    '7486': { width: 120, height: 240, color: '#E0FFFF' },
};

const getICConfig = (name: string): ICConfig => {
    return IC_CONFIG[name] || { width: 120, height: 200, color: '#EEEEEE' };
};

function DigViewerContent() {
    const [file, setFile] = useState<File | null>(null);
    const [wires, setWires] = useState<Wire[]>([]);
    const [components, setComponents] = useState<Component[]>([]);
    const [bounds, setBounds] = useState<CircuitBounds | null>(null);
    const [xmlContent, setXmlContent] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // AI Analysis State
    const [analyzing, setAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

    // Panel visibility
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);

    // Zoom and Pan State
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const minimapRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Azure Function Integration ---
    const callAzureAnalysis = async (xml: string) => {
        setAnalyzing(true);
        setAiResult(null);

        try {
            await new Promise(r => setTimeout(r, 2000));
            const mockData: AIAnalysisResult = {
                summary: "This circuit implements an 8-bit digital combination lock with lockout functionality.",
                suggestions: [
                    "Verify the Reset logic on the 74193 counter; ensure it clears on both button press and successful entry.",
                    "The 7474 flip-flops lack initial state definition; consider adding a power-on reset circuit."
                ],
                riskLevel: "Low"
            };
            setAiResult(mockData);
        } catch (err) {
            setError('Failed to contact analysis service.');
        } finally {
            setAnalyzing(false);
        }
    };

    // --- Parser Logic ---
    const parseDigFile = (xmlText: string) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const wireNodes = xmlDoc.getElementsByTagName('wire');
            const parsedWires: Wire[] = [];
            for (let i = 0; i < wireNodes.length; i++) {
                const p1 = wireNodes[i].getElementsByTagName('p1')[0];
                const p2 = wireNodes[i].getElementsByTagName('p2')[0];
                if (p1 && p2) {
                    parsedWires.push({
                        p1: { x: parseInt(p1.getAttribute('x') || '0'), y: parseInt(p1.getAttribute('y') || '0') },
                        p2: { x: parseInt(p2.getAttribute('x') || '0'), y: parseInt(p2.getAttribute('y') || '0') }
                    });
                }
            }

            const compNodes = xmlDoc.getElementsByTagName('visualElement');
            const parsedComponents: Component[] = [];

            for (let i = 0; i < compNodes.length; i++) {
                const el = compNodes[i];
                const name = el.getElementsByTagName('elementName')[0]?.textContent || 'Unknown';
                const posNode = el.getElementsByTagName('pos')[0];
                const x = parseInt(posNode?.getAttribute('x') || '0');
                const y = parseInt(posNode?.getAttribute('y') || '0');

                const attrs: Record<string, any> = {};
                const attrEntries = el.getElementsByTagName('elementAttributes')[0]?.getElementsByTagName('entry');
                if (attrEntries) {
                    for (let j = 0; j < attrEntries.length; j++) {
                        const key = attrEntries[j].getElementsByTagName('string')[0]?.textContent;
                        const valNode = attrEntries[j].children[1];
                        let val: any = valNode?.textContent;
                        if (valNode?.tagName === 'rotation') {
                            val = parseInt(valNode.getAttribute('rotation') || '0');
                        }
                        if (key) attrs[key] = val;
                    }
                }

                let description = name;
                if (name.endsWith('.dig')) {
                    description = name.replace('.dig', '');
                }

                parsedComponents.push({
                    type: name,
                    attributes: attrs,
                    pos: { x, y },
                    rotation: attrs['rotation'] || 0,
                    label: attrs['Label'] || '',
                    description: description
                });
            }

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const allPoints = [...parsedWires.flatMap(w => [w.p1, w.p2]), ...parsedComponents.map(c => c.pos)];

            allPoints.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            });

            const padding = 100;

            setWires(parsedWires);
            setComponents(parsedComponents);
            setBounds({
                minX: minX - padding,
                minY: minY - padding,
                maxX: maxX + padding,
                maxY: maxY + padding,
                width: (maxX - minX) + (padding * 2),
                height: (maxY - minY) + (padding * 2)
            });

        } catch (err) {
            setError('Failed to parse circuit: ' + (err as Error).message);
        }
    };

    // --- Renderer Logic ---
    useEffect(() => {
        if (!canvasRef.current || !bounds) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = COLORS.CANVAS_BG;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Apply zoom and pan transformations
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.translate(-bounds.minX, -bounds.minY);

        ctx.beginPath();
        ctx.strokeStyle = COLORS.WIRE;
        ctx.lineWidth = 2;
        wires.forEach(w => {
            ctx.moveTo(w.p1.x, w.p1.y);
            ctx.lineTo(w.p2.x, w.p2.y);
        });
        ctx.stroke();

        ctx.fillStyle = COLORS.WIRE;
        wires.forEach(w => {
            ctx.beginPath(); ctx.arc(w.p1.x, w.p1.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(w.p2.x, w.p2.y, 3, 0, Math.PI * 2); ctx.fill();
        });

        components.forEach(comp => {
            ctx.save();
            ctx.translate(comp.pos.x, comp.pos.y);
            if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 2);
            drawComponent(ctx, comp);
            ctx.restore();
        });

    }, [wires, components, bounds, zoom, pan]);

    // --- Minimap Renderer ---
    useEffect(() => {
        if (!minimapRef.current || !bounds || !canvasRef.current) return;
        const ctx = minimapRef.current.getContext('2d');
        if (!ctx) return;

        const minimapW = 200;
        const minimapH = 150;
        const scale = Math.min(minimapW / bounds.width, minimapH / bounds.height);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#2D3748';
        ctx.fillRect(0, 0, minimapW, minimapH);

        ctx.scale(scale, scale);
        ctx.translate(-bounds.minX, -bounds.minY);

        // Draw wires
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 1 / scale;
        ctx.beginPath();
        wires.forEach(w => {
            ctx.moveTo(w.p1.x, w.p1.y);
            ctx.lineTo(w.p2.x, w.p2.y);
        });
        ctx.stroke();

        // Draw components as rectangles
        ctx.fillStyle = '#9CA3AF';
        components.forEach(comp => {
            ctx.fillRect(comp.pos.x - 10, comp.pos.y - 10, 20, 20);
        });

        // Draw viewport rectangle
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        const viewX = (bounds.minX - pan.x / zoom) * scale;
        const viewY = (bounds.minY - pan.y / zoom) * scale;
        const viewW = (canvasRef.current.width / zoom) * scale;
        const viewH = (canvasRef.current.height / zoom) * scale;
        ctx.strokeRect(viewX, viewY, viewW, viewH);

    }, [wires, components, bounds, zoom, pan]);

    // --- Component Drawing functions (keeping same as before) ---
    const drawComponent = (ctx: CanvasRenderingContext2D, comp: Component) => {
        const type = comp.type.replace('.dig', '');
        ctx.strokeStyle = COLORS.COMPONENT_STROKE;
        ctx.fillStyle = COLORS.COMPONENT_BODY;
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        switch (type) {
            case 'And': drawGatePath(ctx, 'AND'); break;
            case 'Or': drawGatePath(ctx, 'OR'); break;
            case 'Not': drawGatePath(ctx, 'NOT'); break;
            case 'NAnd': drawGatePath(ctx, 'AND', true); break;
            case 'NOr': drawGatePath(ctx, 'OR', true); break;
            case 'Tunnel':
                const tunnelText = comp.attributes['NetName'] || 'TUN';
                ctx.font = '10px monospace';
                const textWidth = ctx.measureText(tunnelText).width;
                const tunnelWidth = Math.max(50, textWidth + 20);
                
                ctx.strokeStyle = COLORS.TUNNEL_STROKE;
                ctx.beginPath();
                ctx.moveTo(0, -10); 
                ctx.lineTo(tunnelWidth - 10, -10); 
                ctx.lineTo(tunnelWidth, 0); 
                ctx.lineTo(tunnelWidth - 10, 10); 
                ctx.lineTo(0, 10); 
                ctx.closePath();
                ctx.stroke();
                
                // Counter-rotate text if tunnel is rotated 180 degrees
                ctx.save();
                if (comp.rotation === 2) {
                    ctx.translate(tunnelWidth / 2, 0);
                    ctx.rotate(Math.PI);
                    ctx.translate(-tunnelWidth / 2, 0);
                }
                
                ctx.fillStyle = COLORS.TEXT;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tunnelText, tunnelWidth / 2, 0);
                ctx.restore();
                break;
            case 'LED':
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.stroke();
                const color = comp.attributes['Color'];
                ctx.fillStyle = color ? `rgb(${color.red},${color.green},${color.blue})` : COLORS.LED_OFF;
                ctx.fill();
                if (comp.label) {
                    ctx.fillStyle = COLORS.TEXT;
                    ctx.fillText(comp.label, 0, 20);
                }
                break;
            case 'Button':
            case 'DipSwitch':
                ctx.strokeRect(-10, -10, 20, 20);
                ctx.fillStyle = COLORS.TEXT;
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(type === 'Button' ? 'B' : 'S', 0, 0);
                if (comp.label) ctx.fillText(comp.label, 0, -20);
                break;
            case 'Seven-Seg-Hex':
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 120, 140);
                ctx.strokeStyle = '#555';
                ctx.strokeRect(0, 0, 120, 140);
                ctx.fillStyle = '#F00';
                ctx.font = '60px monospace';
                ctx.fillText('8', 60, 70);
                break;
            case 'Text':
                ctx.fillStyle = COLORS.TEXT;
                ctx.font = comp.attributes['FONT'] || '18px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                const textContent = comp.attributes['Description'] || '';
                ctx.fillText(textContent, -130, 0);
                break;
            case 'Splitter':
                // Draw splitter as a simple vertical black bar
                const bits = parseInt(comp.attributes['Bits'] || '4');
                const spacing = 24; // spacing between bit lines
                const totalHeight = (bits - 1) * spacing;
                
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, -totalHeight / 32, 18, totalHeight);
                
                // Draw individual bit lines with numbers
                ctx.strokeStyle = COLORS.COMPONENT_STROKE;
                ctx.lineWidth = 2;
                ctx.font = '10px sans-serif';
                ctx.fillStyle = COLORS.TEXT;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                
                for (let i = 0; i < bits; i++) {
                    const y = -totalHeight / 2 + (i * spacing);
                    
                    // Draw connection point (small circle)
                    // ctx.beginPath();
                    // ctx.arc(8, y, 3, 0, Math.PI * 2);
                    // ctx.fillStyle = '#FF0000';
                    // ctx.fill();
                    
                    // // Draw bit number
                    // ctx.fillStyle = COLORS.TEXT;
                    // ctx.fillText(i.toString(), 14, y);
                }
                break;
            default:
                if (type.match(/^\d{4}/)) {
                    drawIC(ctx, type, comp.label);
                } else if (['VDD', 'Ground', 'Const'].includes(type)) {
                    drawPowerSymbol(ctx, type);
                } else {
                    ctx.fillStyle = '#FFFFEE';
                    ctx.fillRect(0, 0, 60, 40);
                    ctx.strokeRect(0, 0, 60, 40);
                    ctx.fillStyle = COLORS.TEXT;
                    ctx.font = '10px sans-serif';
                    ctx.fillText(type, 30, 20);
                }
                break;
        }
    };

    const drawGatePath = (ctx: CanvasRenderingContext2D, shape: 'AND' | 'OR' | 'NOT', bubble = false) => {
        ctx.beginPath();
        if (shape === 'AND') {
            ctx.moveTo(0, -20); ctx.lineTo(20, -20);
            ctx.arc(20, 0, 20, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(0, 20); ctx.closePath();
        } else if (shape === 'OR') {
            ctx.moveTo(0, -20);
            ctx.quadraticCurveTo(15, -20, 40, 0);
            ctx.quadraticCurveTo(15, 20, 0, 20);
            ctx.quadraticCurveTo(10, 0, 0, -20);
        } else if (shape === 'NOT') {
            ctx.moveTo(0, -10); ctx.lineTo(25, 0); ctx.lineTo(0, 10); ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
        if (bubble) {
            ctx.beginPath(); ctx.arc(shape === 'NOT' ? 28 : 43, 0, 3, 0, Math.PI * 2); ctx.stroke();
        }
    };

    const drawIC = (ctx: CanvasRenderingContext2D, name: string, label?: string) => {
        const config = getICConfig(name);
        const { width: w, height: h, color } = config;
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = COLORS.COMPONENT_STROKE;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, w, h);
        ctx.beginPath(); ctx.arc(w / 2, 0, 5, 0, Math.PI, false); ctx.stroke();
        
        // Ensure text alignment is centered
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = 'bold 18px monospace';
        ctx.fillText(name, w / 2, h / 2 - 5);
        if (label) {
            ctx.font = '10px sans-serif';
            ctx.fillText(label, w / 2, h / 2 + 10);
        }
    };

    const drawPowerSymbol = (ctx: CanvasRenderingContext2D, type: string) => {
        if (type === 'Ground') {
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(0, 10);
            ctx.moveTo(-10, 10); ctx.lineTo(10, 10);
            ctx.moveTo(-6, 14); ctx.lineTo(6, 14);
            ctx.moveTo(-2, 18); ctx.lineTo(2, 18);
            ctx.stroke();
        } else {
            // Draw upward arrow for VDD/Power
            ctx.strokeStyle = COLORS.COMPONENT_STROKE;
            ctx.fillStyle = '#000000';
            ctx.lineWidth = 2;
            
            // Draw vertical line
            ctx.beginPath();
            ctx.moveTo(0, 20);
            ctx.lineTo(0, 0);
            ctx.stroke();
            
            // Draw arrow head (filled triangle)
            ctx.beginPath();
            ctx.moveTo(0, -10);      // Top point
            ctx.lineTo(-8, 0);       // Bottom left
            ctx.lineTo(8, 0);        // Bottom right
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Draw red dot at connection point
            ctx.beginPath();
            ctx.arc(0, 20, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FF0000';
            ctx.fill();
        }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            const text = await f.text();
            setXmlContent(text);
            parseDigFile(text);
            // Reset zoom and pan when loading new file
            setZoom(1);
            setPan({ x: 0, y: 0 });
        }
    };

    // --- Zoom and Pan Handlers ---
    const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 5));
    const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.1));
    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.max(0.1, Math.min(5, z * delta)));
    };

    // --- Statistics ---
    const stats = useMemo(() => {
        const icCounts: Record<string, number> = {};
        const gateCounts: Record<string, number> = {};

        components.forEach(c => {
            const type = c.type.replace('.dig', '');
            if (type.match(/^\d{4}/)) {
                icCounts[type] = (icCounts[type] || 0) + 1;
            } else if (['And', 'Or', 'Not', 'NAnd', 'NOr', 'XOr'].includes(type)) {
                gateCounts[type] = (gateCounts[type] || 0) + 1;
            }
        });

        return { icCounts, gateCounts, totalComp: components.length };
    }, [components]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Toolbar - integrated with app layout */}
            <div className="flex-none bg-slate-900 border-b border-slate-700 px-4 py-3 -mx-4 -mt-6 sm:-mx-6 lg:-mx-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white">Digital Circuit Analyzer</h1>
                            <p className="text-xs text-slate-400">{file?.name || 'No file loaded'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Open Circuit
                        </button>
                        <input ref={fileInputRef} type="file" accept=".dig" onChange={handleFile} className="hidden" />

                        {components.length > 0 && (
                            <>
                                <div className="w-px h-6 bg-slate-600"></div>

                                <button
                                    onClick={() => setShowLeftPanel(!showLeftPanel)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${showLeftPanel ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    title="Toggle Properties"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowRightPanel(!showRightPanel)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${showRightPanel ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    title="Toggle Analysis"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden mt-4">
                {/* Left Panel */}
                {showLeftPanel && components.length > 0 && (
                    <div className="w-80 flex-none bg-slate-800 border-r border-slate-700 flex flex-col rounded-l-lg overflow-hidden">
                        <div className="flex-none bg-slate-900 px-4 py-3 border-b border-slate-700">
                            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                                <span>Circuit Properties</span>
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* IC Inventory */}
                            <div>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">IC Inventory</h3>
                                <div className="space-y-2">
                                    {Object.keys(stats.icCounts).length > 0 ? (
                                        Object.entries(stats.icCounts).map(([ic, count]) => {
                                            const config = getICConfig(ic);
                                            return (
                                                <div key={ic} className="flex items-center gap-3 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50">
                                                    <div 
                                                        className="w-6 h-6 rounded border-2 border-slate-600 flex-shrink-0"
                                                        style={{ backgroundColor: config.color }}
                                                        title={`Color: ${config.color}`}
                                                    />
                                                    <span className="font-mono font-bold text-slate-200 text-sm flex-1">{ic}</span>
                                                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full font-bold border border-indigo-500/30">×{count}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-slate-500 text-sm italic">No 74xx/40xx chips found</p>
                                    )}
                                </div>
                            </div>

                            {/* Logic Gates */}
                            <div>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Logic Gates</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(stats.gateCounts).map(([gate, count]) => (
                                        <div key={gate} className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                                            <div className="text-xl font-bold text-blue-300">{count}</div>
                                            <div className="text-xs text-blue-400 uppercase mt-1">{gate}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="pt-3 border-t border-slate-700">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Total Components:</span>
                                    <span className="font-bold text-white">{stats.totalComp}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Wires:</span>
                                    <span className="font-bold text-white">{wires.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Center Canvas */}
                <div className="flex-1 flex flex-col rounded-lg overflow-hidden relative" style={{ backgroundColor: '#E5E5E5' }}>
                    <div className="flex-1 overflow-hidden relative">
                        {bounds ? (
                            <>
                                <canvas
                                    ref={canvasRef}
                                    width={bounds.width}
                                    height={bounds.height}
                                    className="w-full h-full cursor-move"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onWheel={handleWheel}
                                />
                                
                                {/* Zoom Controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 bg-slate-800 rounded-lg p-2 shadow-lg">
                                    <button
                                        onClick={handleZoomIn}
                                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center transition"
                                        title="Zoom In"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleZoomReset}
                                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center transition text-xs font-bold"
                                        title="Reset Zoom"
                                    >
                                        {Math.round(zoom * 100)}%
                                    </button>
                                    <button
                                        onClick={handleZoomOut}
                                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center justify-center transition"
                                        title="Zoom Out"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Minimap */}
                                <div className="absolute bottom-4 right-4 bg-slate-800 rounded-lg p-2 shadow-lg">
                                    <div className="text-xs text-slate-400 mb-1 font-medium">Overview</div>
                                    <canvas
                                        ref={minimapRef}
                                        width={200}
                                        height={150}
                                        className="rounded border border-slate-600"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center text-slate-500">
                                    <svg className="w-20 h-20 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg font-medium text-slate-600">No Circuit Loaded</p>
                                    <p className="text-sm text-slate-500 mt-1">Upload a .dig file to begin analysis</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="flex-none bg-slate-950 border-t border-slate-700 px-4 py-2">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4 text-slate-400">
                                <span>Components: <strong className="text-white">{components.length}</strong></span>
                                <span>Wires: <strong className="text-white">{wires.length}</strong></span>
                                {bounds && <span>Canvas: <strong className="text-white">{bounds.width}×{bounds.height}</strong></span>}
                            </div>
                            <div className="text-slate-500">v1.0</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                {showRightPanel && components.length > 0 && (
                    <div className="w-96 flex-none bg-slate-800 border-l border-slate-700 flex flex-col rounded-r-lg overflow-hidden">
                        <div className="flex-none bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 border-b border-indigo-500/30">
                            <h2 className="font-bold text-white flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>AI Circuit Analysis</span>
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <p className="text-indigo-200 text-sm">
                                Detect potential timing hazards, unused pins, and logic optimization opportunities.
                            </p>

                            <button
                                onClick={() => callAzureAnalysis(xmlContent)}
                                disabled={analyzing}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {analyzing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analyzing...
                                    </span>
                                ) : (
                                    'Run AI Analysis'
                                )}
                            </button>

                            {/* AI Results */}
                            {aiResult && (
                                <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                                    <div className="bg-slate-950/50 px-4 py-2 flex justify-between items-center border-b border-slate-700/50">
                                        <span className="text-sm font-semibold text-white">Analysis Report</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            aiResult.riskLevel === 'Low' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}>
                                            {aiResult.riskLevel} Risk
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <p className="text-slate-300 text-sm leading-relaxed">{aiResult.summary}</p>
                                        <div>
                                            <h4 className="font-semibold text-white text-sm mb-2">Suggestions:</h4>
                                            <ul className="space-y-2">
                                                {aiResult.suggestions.map((s, i) => (
                                                    <li key={i} className="flex gap-2 text-slate-400 text-sm">
                                                        <span className="text-indigo-400 flex-shrink-0">•</span>
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DigViewer() {
    return (
        <ProtectedRoute>
            <DigViewerContent />
        </ProtectedRoute>
    );
}