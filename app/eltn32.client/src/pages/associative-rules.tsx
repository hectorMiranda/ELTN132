import { useState } from 'react';

export default function AssociativeRules() {
    const [a, setA] = useState(false);
    const [b, setB] = useState(false);
    const [c, setC] = useState(false);
    const [op, setOp] = useState<'OR' | 'AND'>('OR');

    // Logic Calculation
    const resultLHS = op === 'OR' ? (a || b) || c : (a && b) && c;
    const resultRHS = op === 'OR' ? a || (b || c) : a && (b && c);

    // FIXED: Use Unicode escape sequence instead of the raw character to prevent encoding errors
    const symbol = op === 'OR' ? '+' : '\u2022';

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Associative Rules</h1>
                <div className="flex bg-slate-100 rounded p-1">
                    <button onClick={() => setOp('OR')} className={`px-3 py-1 text-sm font-bold rounded ${op === 'OR' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>OR (+)</button>
                    <button onClick={() => setOp('AND')} className={`px-3 py-1 text-sm font-bold rounded ${op === 'AND' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>AND ({'\u2022'})</button>
                </div>
            </div>

            <p className="mb-6 text-slate-600">
                The Associative Law states that grouping (parentheses) doesn't change the result.
                <br /><span className="font-mono text-sm bg-slate-100 px-1 rounded"> (A {symbol} B) {symbol} C = A {symbol} (B {symbol} C)</span>
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-md p-6 bg-slate-50 flex flex-col gap-8">

                {/* Input Toggles */}
                <div className="flex justify-center gap-8">
                    {['A', 'B', 'C'].map((label, i) => {
                        const val = i === 0 ? a : i === 1 ? b : c;
                        const setVal = i === 0 ? setA : i === 1 ? setB : setC;
                        return (
                            <button key={label} onClick={() => setVal(!val)} className="flex flex-col items-center gap-2">
                                <span className="font-bold text-slate-500">{label}</span>
                                <div className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-xl font-bold transition-all ${val ? 'bg-blue-500 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                                    {val ? 1 : 0}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Visual Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Group 1 */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-400 mb-2">GROUPING 1</span>
                        <div className="text-xl font-mono mb-4 text-slate-700">
                            (<span className={a ? 'text-blue-600' : ''}>A</span> {symbol} <span className={b ? 'text-blue-600' : ''}>B</span>) {symbol} <span className={c ? 'text-blue-600' : ''}>C</span>
                        </div>
                        <div className={`text-2xl font-bold ${resultLHS ? 'text-green-600' : 'text-slate-400'}`}>
                            Output: {resultLHS ? 1 : 0}
                        </div>
                    </div>

                    {/* Group 2 */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-400 mb-2">GROUPING 2</span>
                        <div className="text-xl font-mono mb-4 text-slate-700">
                            <span className={a ? 'text-blue-600' : ''}>A</span> {symbol} (<span className={b ? 'text-blue-600' : ''}>B</span> {symbol} <span className={c ? 'text-blue-600' : ''}>C</span>)
                        </div>
                        <div className={`text-2xl font-bold ${resultRHS ? 'text-green-600' : 'text-slate-400'}`}>
                            Output: {resultRHS ? 1 : 0}
                        </div>
                    </div>
                </div>

                <div className="text-center font-bold text-green-700 bg-green-50 p-2 rounded border border-green-100">
                    Result is {resultLHS === resultRHS ? 'IDENTICAL' : 'DIFFERENT'}
                </div>
            </div>
        </section>
    );
}