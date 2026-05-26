'use client';

import ToolLayout from "./Layout";
import { purpleTools } from "./catalog";
export default function PurpleTool() {
    return (<ToolLayout team="purple" toolList={purpleTools}></ToolLayout>)
}
