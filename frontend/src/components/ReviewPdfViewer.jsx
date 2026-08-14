import React, { memo } from 'react';

const ReviewPdfViewer = ({ fileUrl }) => {
    // console.log("ReviewPdfViewer re-rendered with:", fileUrl); // For debugging if needed

    if (!fileUrl) return <div>No file available</div>;

    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';

    if (isImage) {
        return (
            <div className="prescription-image-container" style={{ overflow: 'auto', maxHeight: '600px' }}>
                <img src={fileUrl} alt="Prescription" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
        );
    } else if (isPdf) {
        return (
            <div className="prescription-pdf-container">
                <embed src={fileUrl} type="application/pdf" width="100%" height="600px" />
            </div>
        );
    } else {
        return (
            <div className="prescription-fallback">
                <p>Unable to preview this file type.</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download File</a>
            </div>
        );
    }
};

// Memoize the component to prevent re-renders when parent state changes (like typing in search)
// It will only re-render if fileUrl changes
export default memo(ReviewPdfViewer);
