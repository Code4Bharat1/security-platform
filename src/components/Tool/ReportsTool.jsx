'use client';

import ToolLayout from "./Layout";
import { reportsTools } from "./catalog";

export default function ReportsTool() {
    return (
    <div className="relative w-full min-h-screen">
            <div className="relative z-10">
                <ToolLayout team="reports" toolList={reportsTools} />
            </div>
        </div>
    );
}
