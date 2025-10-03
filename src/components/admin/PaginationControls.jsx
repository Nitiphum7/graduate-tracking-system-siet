import React, { useState, useEffect } from 'react';
import styles from './PaginationControls.module.css';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
    const [inputPage, setInputPage] = useState(currentPage);

    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    if (totalPages <= 1) {
        return null; // ไม่ต้องแสดงผลถ้ามีแค่หน้าเดียวหรือไม่มีเลย
    }

    const handleInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const handleGoToPage = (e) => {
        e.preventDefault();
        let pageNum = parseInt(inputPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        } else {
            setInputPage(currentPage); // Reset to current page if input is invalid
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const pageNeighbours = 1; // จำนวนหน้าที่จะแสดงข้างๆ หน้าปัจจุบัน (ซ้าย 1, ขวา 1)

        // ✅ CHANGED: Logic การแสดงผลหมายเลขหน้าที่ฉลาดขึ้น
        if (totalPages <= 5) { // ถ้ามีไม่เกิน 5 หน้า ให้แสดงทั้งหมด
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button key={i} onClick={() => onPageChange(i)} className={currentPage === i ? styles.active : ''}>
                        {i}
                    </button>
                );
            }
        } else {
            const leftSpill = currentPage > pageNeighbours + 2;
            const rightSpill = currentPage < totalPages - (pageNeighbours + 1);

            // หน้าแรก
            pages.push(<button key={1} onClick={() => onPageChange(1)} className={currentPage === 1 ? styles.active : ''}>1</button>);
            
            // ... ด้านซ้าย
            if (leftSpill) {
                pages.push(<span key="ellipsis-start" className={styles.ellipsis}>...</span>);
            }
            
            // ตัวเลขตรงกลาง
            const startPage = leftSpill ? currentPage - pageNeighbours : 2;
            const endPage = rightSpill ? currentPage + pageNeighbours : totalPages - 1;

            for (let i = startPage; i <= endPage; i++) {
                pages.push(<button key={i} onClick={() => onPageChange(i)} className={currentPage === i ? styles.active : ''}>{i}</button>);
            }

            // ... ด้านขวา
            if (rightSpill) {
                pages.push(<span key="ellipsis-end" className={styles.ellipsis}>...</span>);
            }

            // หน้าสุดท้าย
            pages.push(<button key={totalPages} onClick={() => onPageChange(totalPages)} className={currentPage === totalPages ? styles.active : ''}>{totalPages}</button>);
        }
        return pages;
    };

    return (
        <div className={styles.paginationControls}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                &laquo; ก่อนหน้า
            </button>
            <div className={styles.pageNumbers}>
                {renderPageNumbers()}
            </div>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                ถัดไป &raquo;
            </button>
            <form onSubmit={handleGoToPage} className={styles.goToPageForm}>
                <input
                    type="number"
                    value={inputPage}
                    onChange={handleInputChange}
                    className={styles.pageInput}
                    min="1"
                    max={totalPages}
                />
                <button type="submit">ไป</button>
            </form>
        </div>
    );
}

export default PaginationControls;