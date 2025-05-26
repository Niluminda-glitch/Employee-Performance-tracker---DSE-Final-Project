// src/components/analytics/AIReportModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertTriangle, Download } from 'lucide-react';
import { Button } from '../ui/button';
import jsPDF from 'jspdf';

const AIReportModal = ({ isOpen, onClose, report, isLoading, error, employeeName }) => {
    if (!isOpen) return null;

    const handleDownloadPDF = () => {
        if (!report) return;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const maxLineWidth = pageWidth - margin * 2;

        // Add header with gradient background
        pdf.setFillColor(100, 58, 237); // Purple
        pdf.rect(0, 0, pageWidth, 35, 'F');

        // Add title
        pdf.setFontSize(18);
        pdf.setTextColor(255, 255, 255); // White
        pdf.text(`AI Performance Analysis: ${employeeName}`, pageWidth / 2, 20, { align: 'center' });

        // Add report metadata
        pdf.setFontSize(10);
        pdf.setTextColor(220, 220, 220); // Light gray
        pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

        // Add horizontal line
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, 40, pageWidth - margin, 40);

        // Add content
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0); // Black
        
        // Split text to fit width and handle newlines
        const splitText = pdf.splitTextToSize(report, maxLineWidth);
        let yPos = 50;

        splitText.forEach(line => {
            if (yPos > pageHeight - margin - 10) { // Check if new page needed
                pdf.addPage();
                yPos = margin;
            }
            pdf.text(line, margin, yPos);
            yPos += 7; // Line height
        });

        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`EmpTrack AI Analytics - Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        pdf.save(`AI_Analysis_${employeeName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                            <h3 className="text-xl font-semibold">
                                AI Performance Analysis for {employeeName}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    <Loader className="animate-spin text-4xl mb-4 text-indigo-500" />
                                    <p className="text-lg">Generating AI insights, please wait...</p>
                                    <p className="text-sm mt-1">This may take a moment.</p>
                                </div>
                            )}
                            
                            {error && !isLoading && (
                                <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 flex items-center">
                                    <AlertTriangle className="mr-2 w-5 h-5" /> 
                                    {error}
                                </div>
                            )}
                            
                            {!isLoading && !error && report && (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                                        {report}
                                    </div>
                                </div>
                            )}
                            
                            {!isLoading && !error && !report && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                                    No AI report generated yet.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {!isLoading && !error && report && (
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIReportModal;
