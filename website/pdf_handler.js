// ================================
// PDF
// ================================
import { PDF_TEXT } from './data.js';

//download pdf function
export async function downloadPdf({
    userAnswers, //variables
    questions,
    categories,
    scores,
    language,
}) {
    const pdf = new jspdf.jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
        compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 40;
    const headerHeight = 70;
    const footerHeight = 40;

    let pageNumber = 1;
    let y;

    const productName = userAnswers[0] || PDF_TEXT[language].noProductNameText;
    const today = new Date().toLocaleDateString("en-GB");

    let radarPDFChart = null; // ensure radar chart variable exists

    // =========================
    // Helper Functions
    // =========================

    //draws page header
    function drawHeader() {
        pdf.setFontSize(22);
        pdf.setTextColor(138, 3, 3);
        pdf.setFont("helvetica", "bold");
        pdf.text(PDF_TEXT[language].reportTitle, margin, 50);

        pdf.addImage("images/CICR.jpg", "JPEG", pageWidth - margin - 60, 20, 60, 40);

        pdf.setDrawColor(50, 46, 133);
        pdf.setLineWidth(2);
        pdf.line(margin, headerHeight, pageWidth - margin, headerHeight);
    }

    //draws footer
    function drawFooter() {
        pdf.setFontSize(9);
        pdf.setTextColor(150);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${PDF_TEXT[language].page} ${pageNumber}`, pageWidth / 2, pageHeight - 20, { align: "center" });
    }

    //function to set up new page
    function newPage() {
        pdf.addPage();
        pageNumber++;
        drawHeader();
        drawFooter();
        y = headerHeight + 30;
        pdf.setTextColor(0); //idk why i have to do this here but i haft giventh upeth
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
    }

    //layouts answers correctly
    function formatAnswer(q, answerSet) {
        pdf.setFont("helvetica", "normal");
        if (answerSet === null) return `${PDF_TEXT[language].skippedQuestionText}`;
        if (q.type === "slider") return `${answerSet}/${q.slider_config.max_value}`;
        if (q.type === "text") return answerSet || "-";
        if (q.type === "checkbox") {
            const selectedAnswers = q.options.filter(o => answerSet.includes(o.id));
            return selectedAnswers.length ? selectedAnswers.map(a => a.label?.[language]).join(", ") : "-";
        }
        if (q.type === "radio") {
            const selectedAnswer = q.options.find(o => o.id == answerSet)
            return selectedAnswer?.label?.[language] || "-";
        }
        return "-";
    }

    //wrap text if go over width
    function addTextWithWrap(text, x, width, lineHeight = 14) {
        const lines = pdf.splitTextToSize(text, width);
        lines.forEach(line => {
            if (y > pageHeight - footerHeight - 20) newPage();
            pdf.text(line, x, y);
            y += lineHeight;
        });
    }

    //does the pdf radar in cool colors with Chart
    function renderPdfRadar(scores) {
        
        const existingChart = Chart.getChart("pdfRadar"); // <- get chart by canvas ID
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = document.getElementById("pdfRadar");

        const data = categories.map((c) => scores[c.id]);

        radarPDFChart = new Chart(ctx, {
            type: "radar",
            data: {
                labels: categories.map(c => c.title[language]),
                datasets: [
                    {
                        label:
                            language === "es"
                                ? "Puntaje de Sostenibilidad"
                                : "Sustainability Score",
                        data,
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        borderColor: "rgba(16, 185, 129, 1)",
                        borderWidth: 2,
                        pointBackgroundColor: "rgba(16, 185, 129, 1)",
                    },
                ],
            },
            options: {
                responsive: true,
                animation: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: { stepSize: 10, font: { size: 10 } },

                        pointLabels: {
                            color: (ctx) => {
                                const colors = [
                                    "#0f4c3a",
                                    "#3bab53",
                                    "#0f4c3a",
                                    "#3bab53",
                                    "#0f4c3a",
                                    "#3bab53",
                                ];
                                return colors[ctx.index];
                            },   //category label color
                            font: {
                                size: 13,        //slightly bigger
                                weight: "600"
                            }
                        }
                    }
                },
                plugins: {
                    legend: { position: "top" },
                },

            }
        });
    }


    // =========================
    // Begin PDF generation
    // =========================

    drawHeader();
    drawFooter();
    y = headerHeight + 30;

    // Title & date
    pdf.setFontSize(18);
    pdf.setTextColor(0);
    pdf.setFont("helvetica", "bold");
    pdf.text(productName, margin, y);
    y += 18;

    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.setFont("helvetica", "normal");
    pdf.text(today, margin, y);
    y += 20;

    // Radar chart
    renderPdfRadar(scores);
    await new Promise(r => setTimeout(r, 300));
    const chartCanvas = document.getElementById("pdfRadar");
    const chartImg = chartCanvas.toDataURL("image/png");
    const chartWidth = pageWidth - margin * 2;
    const chartHeight = chartWidth;
    pdf.addImage(chartImg, "PNG", margin, y, chartWidth, chartHeight); //has to be png cause jpeg messes up background 
    y += chartHeight + 40;

    // Category scores
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.setFont("helvetica", "bold");
    pdf.text(PDF_TEXT[language].categoryScores, margin, y);
    y += 25;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    //lays out categories correctly
    const columnWidth = (pageWidth - margin * 2) / 2;
    let leftY = y;
    let rightY = y;


    categories.forEach((c, i) => {
        pdf.setTextColor(0);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const text = `${c.title[language]}: ${scores[c.id]}`;
        if (i % 2 === 0) { pdf.text(text, margin + 10, leftY); leftY += 18; }
        else { pdf.text(text, margin + 10 + columnWidth, rightY); rightY += 18; }
    });

    // Detailed answers
    newPage();
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.setFont("helvetica", "bold");
    pdf.text(PDF_TEXT[language].detailedResponses, margin, y);
    y += 25;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    questions.forEach((q, i) => {
        const questionNumber = i + 1;
        const answerText = formatAnswer(q, userAnswers[i]);
        const contentWidth = pageWidth - margin * 2;
        const answerIndent = 30;

        addTextWithWrap(`${questionNumber}. ${q.text[language]}`, margin, contentWidth);
        addTextWithWrap(answerText, margin + answerIndent, contentWidth - answerIndent);
        y += 8;
    });

    // Save PDF
    const cleanName = productName.trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, ""); //makes sure product name is in right format
    const cleanTitle = PDF_TEXT[language].reportTitle.trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, ""); //same ^
    const isoDate = new Date().toISOString().split("T")[0]; //writes date 
    pdf.save(`${cleanName}_${cleanTitle}_${isoDate}.pdf`); //pdf saved :D
}