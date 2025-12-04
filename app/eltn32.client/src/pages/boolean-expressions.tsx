import { useState, useMemo } from 'react';

type LogicGate = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';

export default function BooleanExpressions() {
    // STATE: Inputs for the interactive lab
    const [inputA, setInputA] = useState<boolean>(false);
    const [inputB, setInputB] = useState<boolean>(false);
    const [selectedGate, setSelectedGate] = useState<LogicGate>('AND');

    // STATE: For the Equivalence Checker (De Morgan's Law Practice)
    // We use simple presets for studying rather than a complex parser for this demo
    const [eqMode, setEqMode] = useState<'DEMORGAN_1' | 'DEMORGAN_2'>('DEMORGAN_1');

    // --- LOGIC HELPERS ---
    const evaluateLogic = (a: boolean, b: boolean, gate: LogicGate): boolean => {
        switch (gate) {
            case 'AND': return a && b;
            case 'OR': return a || b;
            case 'XOR': return a !== b;
            case 'NAND': return !(a && b);
            case 'NOR': return !(a || b);
            case 'XNOR': return a === b;
            default: return false;
        }
    };

    const getOperatorSymbol = (gate: LogicGate) => {
        switch (gate) {
            case 'AND': return '.';
            case 'OR': return '+';
            case 'XOR': return '⊕';
            case 'NAND': return '↑'; // or .(bar)
            case 'NOR': return '↓'; // or +(bar)
            case 'XNOR': return '⊙';
        }
    };

    // --- TRUTH TABLE GENERATION ---
    // Generates all 4 states (00, 01, 10, 11) for the current gate
    const truthTableData = useMemo(() => {
        return [
            { a: false, b: false },
            { a: false, b: true },
            { a: true, b: false },
            { a: true, b: true },
        ].map(row => ({
            ...row,
            out: evaluateLogic(row.a, row.b, selectedGate),
            isActive: row.a === inputA && row.b === inputB
        }));
    }, [selectedGate, inputA, inputB]);

    // --- EQUIVALENCE CHECKER DATA ---
    const equivalenceData = useMemo(() => {
        const inputs = [
            { a: false, b: false },
            { a: false, b: true },
            { a: true, b: false },
            { a: true, b: true },
        ];

        if (eqMode === 'DEMORGAN_1') {
            // Rule: (A + B)' = A' . B'
            return {
                title: "NOR Equivalence (De Morgan's 1st Law)",
                expr1: "(A + B)'", // NOR
                expr2: "A' . B'", // NOT A and NOT B
                rows: inputs.map(({ a, b }) => ({
                    a, b,
                    res1: !(a || b),
                    res2: (!a && !b),
                    match: (!(a || b)) === (!a && !b)
                }))
            };
        } else {
            // Rule: (A . B)' = A' + B'
            return {
                title: "NAND Equivalence (De Morgan's 2nd Law)",
                expr1: "(A . B)'", // NAND
                expr2: "A' + B'", // NOT A or NOT B
                rows: inputs.map(({ a, b }) => ({
                    a, b,
                    res1: !(a && b),
                    res2: (!a || !b),
                    match: (!(a && b)) === (!a || !b)
                }))
            };
        }
    }, [eqMode]);

    return (
        <section className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Boolean Expressions & Logic Gates</h1>
                    <p className="mt-2 text-slate-600">
                        Interactive lab for ELTN 132. Toggle inputs to visualize logic states.
                    </p>
                </div>
            </div>

            {/* --- TOOL 1: GATE EXPLORER --- */}
            <div className="border-2 border-dashed border-slate-200 rounded-md p-6 bg-white">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Gate Explorer
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT: CONTROLS */}
                    <div className="space-y-6">
                        {/* Gate Selector */}
                        <div className="flex flex-wrap gap-2">
                            {['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].map((gate) => (
                                <button
                                    key={gate}
                                    onClick={() => setSelectedGate(gate as LogicGate)}
                                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${selectedGate === gate
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {gate}
                                </button>
                            ))}
                        </div>

                        {/* Input Toggles */}
                        <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                            {/* Input A */}
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-mono font-bold text-slate-500">Input A</span>
                                <button
                                    onClick={() => setInputA(!inputA)}
                                    className={`w-12 h-12 rounded-full font-mono text-xl border-4 transition-all ${inputA
                                            ? 'bg-green-500 border-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                                            : 'bg-white border-slate-300 text-slate-300'
                                        }`}
                                >
                                    {inputA ? '1' : '0'}
                                </button>
                            </div>

                            {/* Operator Symbol */}
                            <div className="text-4xl font-black text-slate-300">
                                {getOperatorSymbol(selectedGate)}
                            </div>

                            {/* Input B */}
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-mono font-bold text-slate-500">Input B</span>
                                <button
                                    onClick={() => setInputB(!inputB)}
                                    className={`w-12 h-12 rounded-full font-mono text-xl border-4 transition-all ${inputB
                                            ? 'bg-green-500 border-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                                            : 'bg-white border-slate-300 text-slate-300'
                                        }`}
                                >
                                    {inputB ? '1' : '0'}
                                </button>
                            </div>

                            <div className="text-4xl font-black text-slate-300">=</div>

                            {/* Output Result */}
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-mono font-bold text-slate-500">Output</span>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-mono text-3xl font-bold border-4 transition-all ${evaluateLogic(inputA, inputB, selectedGate)
                                        ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                                        : 'bg-slate-800 border-slate-900 text-slate-600'
                                    }`}>
                                    {evaluateLogic(inputA, inputB, selectedGate) ? '1' : '0'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: DYNAMIC TRUTH TABLE */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="bg-slate-100 p-2 font-semibold text-center text-slate-600 border-b border-slate-200">
                            Truth Table: {selectedGate}
                        </div>
                        <table className="w-full text-center text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="py-2">A</th>
                                    <th className="py-2">B</th>
                                    <th className="py-2">Output (Y)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                                {truthTableData.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={`transition-colors duration-200 ${row.isActive ? 'bg-blue-100 font-bold text-blue-800' : 'text-slate-600'
                                            }`}
                                    >
                                        <td className="py-2">{row.a ? '1' : '0'}</td>
                                        <td className="py-2">{row.b ? '1' : '0'}</td>
                                        <td className="py-2">{row.out ? '1' : '0'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- TOOL 2: EQUIVALENCE CHECKER (De Morgan's) --- */}
            <div className="border-2 border-dashed border-slate-200 rounded-md p-6 bg-slate-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                        Equivalence Checker (De Morgan's Laws)
                    </h2>
                    <div className="flex bg-white rounded-md border border-slate-200 p-1">
                        <button
                            onClick={() => setEqMode('DEMORGAN_1')}
                            className={`px-3 py-1 text-xs font-semibold rounded ${eqMode === 'DEMORGAN_1' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'
                                }`}
                        >
                            (A + B)' = A'B'
                        </button>
                        <button
                            onClick={() => setEqMode('DEMORGAN_2')}
                            className={`px-3 py-1 text-xs font-semibold rounded ${eqMode === 'DEMORGAN_2' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'
                                }`}
                        >
                            (AB)' = A' + B'
                        </button>
                    </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">
                    Verify that both expressions produce identical Truth Tables. This proves they are logically equivalent circuits.
                </p>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-center text-sm">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="py-3 w-1/6">A</th>
                                <th className="py-3 w-1/6">B</th>
                                <th className="py-3 w-1/4 bg-purple-50 text-purple-700">{equivalenceData.expr1}</th>
                                <th className="py-3 w-1/4 bg-indigo-50 text-indigo-700">{equivalenceData.expr2}</th>
                                <th className="py-3 w-1/6">Equivalent?</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {equivalenceData.rows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="py-2 text-slate-500">{row.a ? '1' : '0'}</td>
                                    <td className="py-2 text-slate-500">{row.b ? '1' : '0'}</td>
                                    <td className="py-2 font-bold bg-purple-50/30 text-purple-900">{row.res1 ? '1' : '0'}</td>
                                    <td className="py-2 font-bold bg-indigo-50/30 text-indigo-900">{row.res2 ? '1' : '0'}</td>
                                    <td className="py-2">
                                        {row.match
                                            ? <span className="text-green-600 font-bold">✓ Yes</span>
                                            : <span className="text-red-500 font-bold">✗ No</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}