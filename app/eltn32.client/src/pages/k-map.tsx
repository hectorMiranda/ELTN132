import { useState } from 'react';

export default function KMap() {
    // 4x4 Grid state (16 cells)
    const [grid, setGrid] = useState<number[]>(Array(16).fill(0));

    const toggleCell = (index: number) => {
        const newGrid = [...grid];
        newGrid[index] = newGrid[index] === 0 ? 1 : 0;
        setGrid(newGrid);
    };

    // Gray Code Labels
    const colLabels = ['00', '01', '11', '10']; // C D
    const rowLabels = ['00', '01', '11', '10']; // A B

    return (
        <section>
            <h1 className="text-2xl font-semibold">Karnaugh Map (4-Variable)</h1>
            <p className="mt-2 text-slate-600">
                Interactive 4x4 K-Map. Note the <strong>Gray Code</strong> ordering (00 → 01 → 11 → 10).
            </p>

            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-md p-6 flex flex-col items-center">

                <div className="relative p-8 bg-white rounded-lg shadow-sm border border-slate-200">

                    {/* Top Labels (CD) */}
                    <div className="absolute top-2 left-16 right-0 flex justify-around pl-6">
                        <span className="text-sm font-bold text-slate-400 tracking-widest">CD</span>
                    </div>
                    <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-2">

                        {/* Corner */}
                        <div className="flex items-end justify-end pr-2 pb-2 font-bold text-slate-400">AB</div>

                        {/* Column Headers */}
                        {colLabels.map(l => (
                            <div key={l} className="text-center font-mono font-bold text-slate-600 pb-2">{l}</div>
                        ))}

                        {/* Rows */}
                        {rowLabels.map((rowLabel, rowIndex) => (
                            <>
                                {/* Row Header */}
                                <div className="flex items-center justify-end pr-2 font-mono font-bold text-slate-600">{rowLabel}</div>

                                {/* Cells */}
                                {colLabels.map((_, colIndex) => {
                                    const cellIndex = rowIndex * 4 + colIndex;
                                    return (
                                        <button
                                            key={cellIndex}
                                            onClick={() => toggleCell(cellIndex)}
                                            className={`w-12 h-12 sm:w-16 sm:h-16 border rounded text-2xl font-mono transition-all duration-150
                        ${grid[cellIndex] === 1
                                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md transform scale-105'
                                                    : 'bg-slate-50 border-slate-200 text-slate-300 hover:bg-slate-100'
                                                }`}
                                        >
                                            {grid[cellIndex]}
                                        </button>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-sm text-slate-500 bg-yellow-50 p-3 rounded border border-yellow-100">
                    <strong>Study Tip:</strong> Remember that cells "wrap around" the edges. (Left edge connects to Right edge, Top connects to Bottom).
                </div>

            </div>
        </section>
    );
}