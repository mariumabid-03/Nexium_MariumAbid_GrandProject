import React, { useEffect } from 'react';

interface PDFViewerProps {
  pdfBlob: Blob;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfBlob }) => {
  const url = URL.createObjectURL(pdfBlob);

  useEffect(() => {
    return () => URL.revokeObjectURL(url); // Cleanup to prevent memory leaks
  }, [url]);

  return (
    <iframe
      src={url}
      title="PDF Preview"
      width="100%"
      height="100%"
      className="rounded-xl shadow-lg min-h-[50vh] max-h-[80vh] w-full"
      style={{ border: 'none' }}
    />
  );
};

export default PDFViewer;
