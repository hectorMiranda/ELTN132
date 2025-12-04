import React, { useState, useMemo } from 'react';
import { Info, Lightbulb, ArrowRightLeft } from 'lucide-react';

export default function KMapLearningTool() {
    // 4x4 Grid state (16 cells), representing indices 0-15
    const [grid, setGrid] = useState<number[]>(Array(16).fill(0));
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Gray Code Labels (Binary values: 0, 1, 3, 2)
    const GRAY_CODE = [0, 1, 3, 2];
    const GRAY_LABELS = ['00', '01', '11', '10'];

    const toggleCell = (index: number) => {
        const newGrid = [...grid];
        newGrid[index] = newGrid[index] === 0 ? 1 : 0;
        setGrid(newGrid);
    };

    // Helper: Convert integer 0-15 to "A'BC'D" format
    const getMinterm = (n: number) => {
        const vars = ['A', 'B', 'C', 'D'];
        return vars.map((v, i) => {
            // Check specific bit: (n >> (3-i)) & 1
            const isOne = (n >> (3 - i)) & 1;
            return isOne ? v : `${v}'`;
        }).join('');
    };

    // Generate Equation string
    const booleanExpression = useMemo(() => {
        const minterms = grid
            .map((val, idx) => (val === 1 ? idx : -1))
            .filter((idx) => idx !== -1);

        if (minterms.length === 0) return '0';
        if (minterms.length === 16) return '1';

        return minterms.map(idx => getMinterm(idx)).join(' + ');
    }, [grid]);

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans text-slate-800">

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Interactive K-Map & Truth Table</h1>
                <p className="text-slate-500 mt-2">
                    Visualize how binary inputs (Truth Table) map spatially to the grid to enable logic simplification.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Truth Table (Inputs) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-700">Truth Table</h2>
                        <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border">Inputs &rarr; Output</span>
                    </div>

                    <div className="overflow-y-auto flex-1 p-0">
                        <table className="w-full text-sm text-center">
                            <thead className="sticky top-0 bg-slate-100 text-slate-600 font-mono shadow-sm">
                                <tr>
                                    <th className="py-2">Dec</th>
                                    <th className="py-2">A</th>
                                    <th className="py-2">B</th>
                                    <th className="py-2">C</th>
                                    <th className="py-2">D</th>
                                    <th className="py-2 bg-blue-50 text-blue-600">Y</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono">
                                {Array.from({ length: 16 }).map((_, i) => {
                                    // Calculate bits for display
                                    const bits = [3, 2, 1, 0].map(bit => (i >> bit) & 1);
                                    const isActive = hoveredIndex === i;
                                    const isHigh = grid[i] === 1;

                                    return (
                                        <tr
                                            key={i}
                                            onMouseEnter={() => setHoveredIndex(i)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            onClick={() => toggleCell(i)}
                                            className={`cursor-pointer transition-colors duration-75 
                        ${isActive ? 'bg-indigo-50' : 'even:bg-slate-50'}
                        ${isHigh ? 'text-blue-700 font-bold' : 'text-slate-400'}
                      `}
                                        >
                                            <td className="py-2 border-r border-slate-100 text-slate-400 font-sans text-xs">{i}</td>
                                            {bits.map((b, idx) => <td key={idx} className="py-2">{b}</td>)}
                                            <td className={`py-2 border-l border-slate-200 ${isHigh ? 'bg-blue-100' : ''}`}>
                                                {grid[i]}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COLUMN: K-MAP + Logic */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Main K-Map Area */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center relative min-h-[400px]">

                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <span className="w-3 h-3 bg-indigo-100 border border-indigo-300 rounded-full"></span>
                                <span>Hovered</span>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="relative">
                            {/* CD Label */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-400 tracking-widest">CD</div>
                            {/* AB Label */}
                            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 tracking-widest -rotate-90">AB</div>

                            <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-3">

                                {/* Top-Left Corner (Empty) */}
                                <div></div>

                                {/* Column Headers (CD) */}
                                {GRAY_LABELS.map(l => (
                                    <div key={l} className="text-center font-mono font-bold text-slate-600">{l}</div>
                                ))}

                                {/* Rows */}
                                {GRAY_CODE.map((rowVal, rowIndex) => (
                                    <React.Fragment key={rowIndex}>
                                        {/* Row Header (AB) */}
                                        <div className="flex items-center justify-end font-mono font-bold text-slate-600 pr-2">
                                            {GRAY_LABELS[rowIndex]}
                                        </div>

                                        {/* Cells */}
                                        {GRAY_CODE.map((colVal, colIndex) => {
                                            // Calculate the true linear index (0-15) based on Row/Col bits
                                            // Formula: (AB << 2) | CD
                                            const trueIndex = (rowVal << 2) | colVal;
                                            const isHigh = grid[trueIndex] === 1;
                                            const isHovered = hoveredIndex === trueIndex;

                                            return (
                                                <button
                                                    key={trueIndex}
                                                    onMouseEnter={() => setHoveredIndex(trueIndex)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                    onClick={() => toggleCell(trueIndex)}
                                                    className={`
                            w-14 h-14 sm:w-20 sm:h-20 rounded-lg text-2xl font-mono border-2 transition-all duration-200
                            flex items-center justify-center relative
                            ${isHovered ? 'ring-4 ring-indigo-200 z-10 scale-110' : ''}
                            ${isHigh
                                                            ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                                                            : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300'
                                                        }
                          `}
                                                >
                                                    {grid[trueIndex]}
                                                    {/* Small index number in corner for learning */}
                                                    <span className={`absolute top-1 left-1 text-[10px] opacity-50 ${isHigh ? 'text-blue-100' : 'text-slate-400'}`}>
                                                        {trueIndex}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Equation Display */}
                    <div className="bg-slate-900 text-green-400 font-mono p-5 rounded-lg shadow-inner border border-slate-700 flex items-center gap-4">
                        <span className="text-slate-500 select-none">F(A,B,C,D) = </span>
                        <span className="text-lg break-all">{booleanExpression}</span>
                    </div>

                    {/* Educational Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3">
                            <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-800 text-sm">Why "Gray Code"?</h3>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                    Notice the headers go <span className="font-mono bg-white px-1 rounded border border-amber-200">00 01 11 10</span>.
                                    This ensures only <strong>1 bit changes</strong> between adjacent cells.
                                    This geometric adjacency allows us to mathematically group terms!
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                            <ArrowRightLeft className="w-6 h-6 text-blue-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-blue-800 text-sm">The World Wraps Around</h3>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    The grid wraps! The leftmost column connects to the rightmost column,
                                    and the top row connects to the bottom row. Don't forget to group corners!
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}