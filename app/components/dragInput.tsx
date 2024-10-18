import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

interface DragInputProps {
    label?: string;
    min?: number;
    step?: number;
    value?: number;
    unit: string;
    onInput?: (value: number) => void;
}

export default function DragInput({
    label,
    min = 0,
    step = 1,
    value,
    unit,
    onInput,
}: DragInputProps) {
    const constraintsRef = useRef(null);
    const [ref, bounds] = useMeasure();

    const [isLoaded, setIsLoaded] = useState(false);
    const [preVal, setPrevVal] = useState(value);
    const [val, setVal] = useState(value);
    const [increment, setIncrement] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [ruleScaleX, setRuleScaleX] = useState(0);

    const handleDrag = (event: Event, info: PanInfo) => {
        const lengthPerStep = Math.max(12, bounds.width / 30);
        const { x } = info.offset;
        const increment = Math.floor(x / lengthPerStep) * step;
        setIncrement(increment);

        const ruleScaleX = x / (bounds.width / 2);
        setRuleScaleX(ruleScaleX);
    };

    const handleDragEnd = useCallback(() => {
        setDragging(false);
        setPrevVal(val);
        setRuleScaleX(0);
    }, [val]);

    useEffect(() => {
        if (dragging && !isNaN(preVal!)) {
            setVal(Math.max(min, preVal! + increment));
        }
    }, [preVal, increment, dragging]);

    useEffect(() => {
        if (!isNaN(value!) && !isLoaded) {
            setVal(value);
            setPrevVal(value);
            setIsLoaded(true);
        }
    }, [value, isLoaded]);

    useEffect(() => {
        if (onInput && !isNaN(val!)) {
            onInput(val!);
        }
    }, [val]);

    return (
        <div className="flex flex-col w-full gap-2">
            <motion.div layout className="flex text-3xl items-center">
                <motion.div
                    layout
                    className="font-[family-name:var(--font-geist-sans)] opacity-60"
                    animate={{ opacity: dragging ? 0.1 : 0.6 }}
                >
                    {label}
                </motion.div>

                <motion.div
                    layout
                    className="flex-1 text-right font-[family-name:var(--font-geist-mono)]"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isNaN(val!) ? 0 : 1 }}
                    >
                        <NumberFlow
                            value={val ?? 0}
                            locales="en-US"
                            animated={false}
                            format={{
                                style: "unit",
                                unit,
                                unitDisplay: "narrow",
                                minimumFractionDigits:
                                    String(step).split(".")[1]?.length || 0,
                            }}
                        ></NumberFlow>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Track */}
            <motion.div
                ref={ref}
                className="relative h-20 w-full bg-[#212121] rounded-xl"
            >
                <motion.div ref={constraintsRef} className="absolute inset-0">
                    <AnimatePresence>
                        {ruleScaleX !== 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div className="absolute left-[calc(50%-6px)] right-0 top-[calc(50%-6px)] w-[12px] aspect-square rounded-full bg-[#323232]"></motion.div>
                                <motion.div
                                    className="absolute left-[50%] right-0 top-[calc(50%-1px)] h-[2px] bg-[#323232] origin-left"
                                    initial={{ scaleX: 0 }}
                                    animate={{
                                        scaleX: ruleScaleX,
                                    }}
                                    transition={{ duration: 0.1 }}
                                ></motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Knob */}
                    <motion.div
                        className="absolute top-2 bottom-2 w-12 rounded-md custom-box left-[calc(50%-1.5rem)] touch-manipulation"
                        drag={!isNaN(val!) ? "x" : false}
                        whileHover={{ filter: "brightness(1.5)", scale: 1.05 }}
                        dragConstraints={constraintsRef}
                        dragSnapToOrigin={true}
                        dragElastic={0.2}
                        onDragStart={() => setDragging(true)}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                    ></motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
