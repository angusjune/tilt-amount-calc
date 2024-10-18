"use client";

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { useCallback, useEffect, useState } from "react";
import DragInput from "./components/dragInput";

function calculateTiltAngle(
    focalLengthMm: number,
    focusPlaneDistanceM: number
): number {
    const h = focusPlaneDistanceM * 1000; // Convert meters to millimeters
    const thetaRadians = Math.atan(focalLengthMm / h);
    const thetaDegrees = thetaRadians * (180 / Math.PI);
    return thetaDegrees;
}

export default function Home() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [tiltAngle, setTiltAngle] = useState(0);
    const [focalLengthMm, setFocalLengthMm] = useState<number | undefined>(
        undefined
    );
    const [focusPlaneDistanceM, setFocusPlaneDistanceM] = useState<
        number | undefined
    >(undefined);

    useEffect(() => {
        const storedFocalLengthMm = localStorage.getItem("focalLengthMm") ?? 16;
        const storedFocusPlaneDistanceM =
            localStorage.getItem("focusPlaneDistanceM") ?? 0.5;

        setFocalLengthMm(Number(storedFocalLengthMm));
        setFocusPlaneDistanceM(Number(storedFocusPlaneDistanceM));

        setIsLoaded(true);
    }, []);

    useEffect(() => {
        getTitleAngle();
    }, [focalLengthMm, focusPlaneDistanceM]);

    useEffect(() => {
        if (isLoaded && !isNaN(focalLengthMm!)) {
            localStorage.setItem("focalLengthMm", focalLengthMm!.toString());
        }
    }, [isLoaded, focalLengthMm]);

    useEffect(() => {
        if (isLoaded && !isNaN(focusPlaneDistanceM!)) {
            localStorage.setItem(
                "focusPlaneDistanceM",
                focusPlaneDistanceM!.toString()
            );
        }
    }, [isLoaded, focusPlaneDistanceM]);

    const getTitleAngle = useCallback(() => {
        if (!isNaN(focalLengthMm!) && !isNaN(focusPlaneDistanceM!)) {
            const angle = calculateTiltAngle(
                focalLengthMm!,
                focusPlaneDistanceM!
            );
            setTiltAngle(isNaN(angle) ? 0 : angle);
        }
    }, [focalLengthMm, focusPlaneDistanceM]);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <motion.div className="font-[family-name:var(--font-geist-sans)] font-semibold gradient-text text-8xl inline-flex mr-[-0.5ch]">
                    <NumberFlow
                        value={tiltAngle}
                        format={{ maximumFractionDigits: 1 }}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    />
                    <motion.span layout>°</motion.span>
                </motion.div>

                <div className="w-full flex gap-8 items-center flex-col sm:flex-row">
                    <DragInput
                        label="Focal Length"
                        value={focalLengthMm}
                        onInput={(val) => setFocalLengthMm(val)}
                        min={1}
                        unit="millimeter"
                    />

                    <DragInput
                        label="Camera to Ground"
                        value={focusPlaneDistanceM}
                        step={0.1}
                        min={0.1}
                        onInput={(val) => setFocusPlaneDistanceM(val)}
                        unit="meter"
                    />
                </div>
            </main>
        </div>
    );
}
