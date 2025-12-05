import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

function BinaryToDecimalContent() {
    // Explicitly type the state as an array of numbers
    const [bits, setBits] = useState<number[]>(Array(8).fill(0));

    // Type the index parameter as a number
    const toggleBit = (index: number) => {
        const newBits = [...bits];
        newBits[index] = newBits[index] === 0 ? 1 : 0;
        setBits(newBits);
    };

    // Add return type number
    const calculateDecimal = (): number => {
        return bits.reduce((acc, bit, index) => {
            const weight = Math.pow(2, 7 - index);
            return acc + (bit * weight);
        }, 0);
    };

    return (
        <section>
            <h1 className="text-2xl font-semibold">Binary to Decimal</h1>
            <p className="mt-2 text-slate-600">
                Click the bits below to toggle them. Watch how the "Place Value" adds to the total.
            </p>

            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-md p-6 min-h-[200px] flex flex-col items-center gap-6">

                {/* Binary Bits Interface */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {bits.map((bit, index) => {
                        const placeValue = Math.pow(2, 7 - index);
                        return (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{placeValue}</span>
                                <button
                                    onClick={() => toggleBit(index)}
                                    className={`w-10 h-12 rounded-md border-2 font-mono text-xl transition-all duration-200 
                    ${bit === 1
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                            : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'
                                        }`}
                                >
                                    {bit}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Calculation Visualization */}
                <div className="w-full max-w-2xl bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-slate-500 mb-2">CALCULATION:</p>
                    <div className="font-mono text-slate-700 break-words">
                        {bits.map((bit, index) => {
                            const weight = Math.pow(2, 7 - index);
                            if (bit === 0) return null;
                            return (
                                <span key={index} className="inline-block mr-2">
                                    <span className="text-blue-600 font-bold">{weight}</span>
                                    {/* Show plus sign if it's not the last active bit */}
                                    {bits.slice(index + 1).some(b => b === 1) && <span className="text-slate-400 mx-1">+</span>}
                                </span>
                            );
                        })}
                        {calculateDecimal() === 0 && <span className="text-slate-400 italic">0 (no bits active)</span>}
                    </div>
                </div>

                {/* Final Result */}
                <div className="text-center">
                    <span className="text-slate-500 text-lg">Decimal Result: </span>
                    <span className="text-4xl font-bold text-slate-800">{calculateDecimal()}</span>
                </div>

            </div>
        </section>
    );
}

export default function BinaryToDecimal() {
    return (
        <ProtectedRoute>
            <BinaryToDecimalContent />
        </ProtectedRoute>
    );
}