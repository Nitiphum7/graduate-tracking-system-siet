import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import './Templates.css';

function formatThaiDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function TemplatesPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const API_URL = 'http://localhost:3000';

    const [templates, setTemplates] = useState([]);
    const [completedDocs, setCompletedDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const loadTemplateData = async () => {
            try {
                // เรียก API 2 ตัวพร้อมกัน
                const [templatesResponse, completedDocsResponse] = await Promise.all([
                    fetch(`${API_URL}/api/templates`),
                    fetch(`${API_URL}/api/completed-documents/${user.id}`)
                ]);

                if (!templatesResponse.ok || !completedDocsResponse.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลได้');
                }

                const templatesData = await templatesResponse.json();
                const completedDocsData = await completedDocsResponse.json();

                setTemplates(templatesData);
                setCompletedDocs(completedDocsData);

            } catch (err) {
                console.error("Failed to load template page data:", err);
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setIsLoading(false);
            }
        };

        loadTemplateData();
    }, [user, authLoading, navigate]);

    if (error) {
        return <main className="page-container"><p style={{ color: 'red', textAlign: 'center' }}>{error}</p></main>;
    }

    return (
        <main className="page-container">
            <h1><i className="fas fa-download"></i> ดาวน์โหลดเอกสาร</h1>

            <section className="template-section">
                <h2 className="section-title">แบบฟอร์มเปล่า (Templates)</h2>
                <p className="section-description">สำหรับดาวน์โหลดเพื่อกรอกข้อมูลหรือดูเป็นตัวอย่าง</p>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>📄 ชื่อเอกสาร</th>
                                <th>ดาวน์โหลด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="2" className="loading-text">กำลังโหลดข้อมูล...</td></tr>
                            ) : (
                                templates.map((template, index) => (
                                    <tr key={`template-${index}`}>
                                        <td>{template.name}</td>
                                        <td className="download-links">
                                            <a href={template.docx_path} title="ดาวน์โหลด .docx" download><i className="fas fa-file-word"></i></a>
                                            <a href={template.pdf_path} title="ดาวน์โหลด .pdf" download><i className="fas fa-file-pdf"></i></a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="template-section">
                <h2 className="section-title">เอกสารฉบับสมบูรณ์ของคุณ (Completed Documents)</h2>
                <p className="section-description">เอกสารที่ผ่านการอนุมัติครบทุกขั้นตอนแล้ว สามารถดาวน์โหลดเป็นไฟล์ PDF ได้</p>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>📑 ชื่อเอกสารที่ยื่น</th>
                                <th>วันที่อนุมัติล่าสุด</th>
                                <th>ดาวน์โหลด (PDF)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="3" className="loading-text">กำลังโหลดข้อมูล...</td></tr>
                            ) : completedDocs.length === 0 ? (
                                <tr><td colSpan="3" className="loading-text">ยังไม่มีเอกสารฉบับสมบูรณ์ที่ผ่านการอนุมัติ</td></tr>
                            ) : (
                                completedDocs.map((doc, index) => (
                                    <tr key={`completed-${index}`}>
                                        <td>{doc.title}</td>
                                        <td>{formatThaiDate(doc.approved_date)}</td>
                                        <td className="download-links">
                                            <a href={doc.link} title="ดาวน์โหลด .pdf" download><i className="fas fa-file-pdf"></i></a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}

export default TemplatesPage;