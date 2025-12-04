import { useState, useMemo, ChangeEvent } from 'react';

// Define the shape of our step object so TypeScript knows what "steps" contains
interface CalculationStep {
    weight: number;
    bit: 0 | 1;
    fits: boolean;
    remaining: number;
    explanation: string;
}

export default function DecimalToBinary() {
    const [decimalStr, setDecimalStr] = useState<string>('156');

    const weights: number[] = [128, 64, 32, 16, 8, 4, 2, 1];

    const calculationSteps = useMemo(() => {
        let num = parseInt(decimalStr, 10);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 255) num = 255;

        // Explicitly tell TypeScript this array contains CalculationStep objects
        const steps: CalculationStep[] = [];
        let currentTotal = num;

        weights.forEach((weight) => {
            if (currentTotal >= weight) {
                steps.push({
                    weight,
                    bit: 1,
                    fits: true,
                    remaining: currentTotal - weight,
                    explanation: `${weight} fits into ${currentTotal}`
                });
                currentTotal -= weight;
            } else {
                steps.push({
                    weight,
                    bit: 0,
                    fits: false,
                    remaining: currentTotal,
                    explanation: `${weight} does not fit into ${currentTotal}`
                });
            }
        });
        return steps;
    }, [decimalStr]);

    // Add ChangeEvent type for the input handler
    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setDecimalStr(val);
    };

    return (
        <section>
            <h1 className="text-2xl font-semibold">Decimal to Binary</h1>
            <p className="mt-2 text-slate-600">
                Enter a decimal number (0-255). See how we "fit" powers of 2 into it.
            </p>

            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-md p-6 min-h-[200px] flex flex-col gap-6">

                {/* Input Area */}
                <div className="flex items-center gap-4">
                    <label className="font-semibold text-slate-700">Decimal Input:</label>
                    <input
                        type="text"
                        value={decimalStr}
                        onChange={handleInput}
                        maxLength={3} /* Fixed: Changed string "3" to number {3} */
                        className="border border-slate-300 rounded px-3 py-2 text-lg font-mono w-24 focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400">(Max 255 for 8-bit visualization)</span>
                </div>

                {/* Visual Explanation Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-slate-100 p-2 font-semibold text-xs text-slate-600 uppercase tracking-wider">
                        <div>Place Value</div>
                        <div>Logic</div>
                        <div>Bit</div>
                        <div>Remaining</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {calculationSteps.map((step) => (
                            <div key={step.weight} className={`grid grid-cols-[1fr_1fr_1fr_1fr] p-2 text-sm ${step.fits ? 'bg-blue-50/50' : 'bg-white'}`}>
                                <div className="font-bold text-slate-700">{step.weight}</div>
                                <div className={`text-xs flex items-center ${step.fits ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                                    {step.explanation}
                                </div>
                                <div className="font-mono font-bold text-lg">
                                    <span className={step.bit === 1 ? 'text-blue-600' : 'text-slate-300'}>
                                        {step.bit}
                                    </span>
                                </div>
                                <div className="text-slate-500 font-mono">{step.remaining}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Result */}
                <div className="flex items-center justify-between bg-slate-800 text-white p-4 rounded-md shadow-sm">
                    <span className="font-medium text-slate-300">Binary Result:</span>
                    <div className="font-mono text-2xl tracking-[0.2em]">
                        {calculationSteps.map(s => s.bit).join('')}
                    </div>
                </div>

            </div>
        </section>
    );
}