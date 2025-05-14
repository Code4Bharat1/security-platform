'use client';
import { useState } from "react";
import { runJSAnalysis } from "../../../analyzer/jsScanner";
import AnalysisForm from "@/components/codeAnalysis/codeAnalysis";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";



export default function Home() {
 
  return (
   <div>
    <Navbar/>
    <AnalysisForm/>
   </div>
  );
}
// <AnalysisResult issues={issues} />