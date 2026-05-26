'use client';

import ToolLayout from "./Layout";
import { redTools } from "./catalog";

export default function RedTool() {
    return (
    <div className="relative w-full min-h-screen">
            <div className="relative z-10">
                <ToolLayout team="red" toolList={redTools} />
            </div>
        </div>
    );
}
