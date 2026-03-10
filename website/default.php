<!DOCTYPE html> 
<html lang="es"> 
<head> 
  <meta charset="UTF-8" /> 
  <title>CICR Product Sustainability Assessment</title> 
  <meta name="viewport" content="width=device-width, initial-scale=1" /> 
  
  <link rel="stylesheet" href="styles.css"> 

  <link rel="icon" type="image/png" href="images/favicon.png"> 
  
  <!-- other libs--> 
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> 
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
  
 <script type="module" src="app.js"></script>

  </head> 
  
  <!-- BODY -->
  <body> 
    <header class="top-banner"> 
      <div class="top-left" id="toolTitle"></div> 

      <section id="quizProgress" hidden>
        <div class="top-center">
          <div class="category-label" id="progressCategoryLabel"></div>

          <div class="progress-row">
            <span class="progress-label" id="progressBarLabel"></span>

            <progress id="progressBarVisual"></progress>

            <span class="progress-text" id="progressBarText">3 / 40</span>
          </div>
        </div>
      </section>
      
      
      <div class="top-right"> 
        <button id="esBtn">Español</button> 
        <button id="enBtn">English</button> 
      </div> 
    </header> 
    
    <!-- LANDING --> 
    <section id="landing"> 
      <div class="card"> 
        <h1 id="title"></h1> 
        <p class="preamble-important" id="preambleIntro"></p>
        <a  href="manuals/user_manual_es.pdf" target="_blank" id="userManualLink"></a> 
        <p class="muted" id="preambleIntroDetails"></p> 
        <p class="preamble-important" id="preambleConsent"></p> 
        <p class="muted" id="preambleConsentDetails"></p> 
        <button id="startBtn"></button>
      </div> 
    </section> 
    
    <!-- QUIZ -->
    <section id="quiz" hidden>
      <div class="card">
        <h2 id="question"></h2>
        <div id="answers"></div>

        <div style="display:flex; gap:12px;">
          <button id="backBtn"></button>
          <button id="nextBtn"></button>
          <button id="skipBtn" style="margin-left:auto;"></button>
        </div>

      </div>
    </section>
    <!-- RESULTS --> 
     <section id="results" hidden> 
      <div class="dashboard">

        <h2 id="resultsTitle"></h2>

        <div id="chartPanel">
          <canvas id="radarChart"></canvas>
          
        </div>

        <div id="scoreOutput"></div>
        <div id="categoryInfoOutput" hidden></div>
        

        <button id="backToScoresBtn" hidden></button>
        
        <button id="downloadPdf"></button>
        

      </div>
    </section> 
      
    <!-- FOOTER--> 
    <footer class="bottom-banner"> 
      <div class="footer-left"> 
        <img src="images/CICR.jpg" alt="CICR Logo" class="footer-logo" /> 
      </div> 
      <div class="footer-center"> 
        <p id="disclaimer"></p> 
      </div> 
      
      <div class="footer-right"> 
        <img src="images/WPI.png" alt="WPI Logo" class="footer-logo" /> 
      </div> 
    </footer> 
    
    <!-- PDF -->
<div id="pdfContent" 
     style="width:900px; padding:0; font-family:Arial; background:#fff; position:absolute; left:-9999px; top:0;">

  <!-- PAGE 1: Radar Chart + Scores -->
  <div class="pdf-page" style="padding:32px; page-break-after:always;">
    <!-- TOP BANNER -->
    <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 32px; border-bottom:3px solid #322e85;">
      <div>
        <h1 id="pdfProductName" style="margin:0; font-size:26px; color:#0f4c3a;"></h1>
        <h2 id="pdfTitle" style="margin:4px 0 0 0; color:#982727;"></h2>  
      </div>
      <img src="images/CICR.jpg" style="width:80px;" />
    </div>

    <!-- RADAR CHART -->
    <div style="display:flex; justify-content:center; margin-top:24px;">
      <div id="pdfRadarWrapper">
        <canvas id="pdfRadar"></canvas>
      </div>
    </div>

    <!-- SCORES -->
    <div id="pdfScores" style="margin:32px; display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:15px;"></div>
  </div>

  <!-- PAGE 2: Questions + Answers -->
  <div class="pdf-page" style="padding:32px;">
    <div id="pdfAnswers"></div>
  </div>
</div>

  
</body> 

</html>