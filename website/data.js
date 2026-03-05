//Function to retrieve question data from database
export async function getCategoriesAndQuestions() {
    const response = await fetch("/db_fetch.php");
    return await response.json();
}

export const UI_TEXT = {
  es: {
    bannerTitle: "Herramienta de Evaluación de Sostenibilidad",
    title: "Evaluación de Sostenibilidad de Productos – CICR",
    preambleIntro:
      "Esta herramienta está destinada a ofrecer orientación para la mejora de la sostenibilidad de un único producto y sus prácticas de fabricación. Se trata de una porción de cuestionario que requerirá información sobre un producto singular. Esta herramienta comenzará con una porción de la encuesta que contiene alrededor de 40 preguntas que tardará 20-30 minutos en terminar. Para obtener información detallada sobre la herramienta y otras respuestas a preguntas, consulte este documento: --ENLACE DEL DOCUMENTO AQUÍ-- ",
    preambleIntroDetails:
      "Las primeras preguntas estarán enfocadas en la demografía y son para usted y el mantenimiento de registros del CICR. Las preguntas solo pueden aumentar su puntuación, y ninguna respuesta restará de su puntuación total. Cada pregunta tendrá la opción de responder, “No aplicable/No seguro”, y esa pregunta no será utilizada en el cálculo final de la puntuación. Tras la entrega, se mostrará un gráfico de radar junto con las puntuaciones de tu producto en cada una de las categorías. Tendrás la opción de descargar una copia de tu salida para tu uso interno. Esta herramienta fue creada en conjugación por un grupo estudiantil IQP del Worcester Polytechnic Institute, ubicado en Massachusetts, Estados Unidos. ",
    preambleConsent:
      "La información recopilada o creada por esta herramienta se guardará en una base de datos del CICR y solo será accesible para representantes seleccionados del CICR. Continuar más allá de esta página actúa como tu firma electrónica de consentimiento para estos términos. ",
    preambleConsentDetails:
      "CICR utilizará estos datos para la elaboración de informes estadísticos y no publicará ninguna información de identificación con respecto a su producto, procesos o empresa. Toda la información será tratada con la más estricta confidencialidad, y los resultados serán presentados solo de manera agregada. La opción de compartir sus resultados más allá de esto permanece únicamente con su empresa. Los resultados no se guardarán hasta que se responda la pregunta final.",
    start: "Iniciar Evaluación",
    next: "Siguiente",
    back: "Atrás",
    skip: "No aplica/No sabe",
    results: "Resultados",
    download: "Descargar PDF",
    backToScores: "Volver a los Resultados",
    select: "Seleccione una opción",
    disclaimer:
      "Para consultas sobre esta herramienta, escriba a ahidalgo@cicr.com",
  },
  en: {
    bannerTitle: "Sustainability Assessment Tool",
    title: "CICR Product Sustainability Assessment",
    preambleIntro:
      "This tool is meant to provide guidance for the improvement of sustainability for single product and its manufacturing practices. It involves a questionnaire portion which will require input about a singular product. This tool will begin with a survey portion containing about 40 questions which will take 20-30 minutes to finish. For detailed information on the tool and FAQs, please reference this document: --DOCUMENT LINK HERE-- ",
    preambleIntroDetails:
      "The first few questions will be demographic focused and are for you and CICR’s record keeping.  Questions can only increase your score, and no answer will subtract from your total score. Each question will have the option to answer, “Not applicable/Not sure”, and that question will not be used in the final score calculation. After submission, a radar chart will be displayed, along with the scores of your product for each of the categories. You will have the option to download a copy of your output for your internal use. This tool was made in conjugation by a student IQP group from Worcester Polytechnic Institute located in Massachusetts, United States. ",
    preambleConsent:
      "Information that is collected or created by this tool will be saved to a CICR database and will only be accessible to select CICR representatives. Continuing past this page acts as your electronic consent signature for these terms.",
    preambleConsentDetails:
      "CICR will use this data for statistical reporting and will not publish any identifying information regarding your product, processes, or company. All information will be treated with the strictest confidentiality, and the results will be presented only in an aggregate manner. The option to share your results beyond this remains solely with your company. Results will not be saved until the final question is answered.",
    start: "Start Assessment",
    next: "Next",
    back: "Back", 
    skip: "Not applicable/Not sure",
    results: "Results",
    download: "Download PDF",
    backToScores: "Back to Scores",
    select: "Please select an option",
    disclaimer:
      "For questions about this tool, contact ahidalgo@cicr.com",
  },
};

export const PDF_TEXT = {
  en: {
    reportTitle: "Sustainability Assessment Report",
    detailedResponses: "Detailed Responses",
    categoryScores: "Category Scores",
    page: "Page",
    skippedQuestionText: "Not applicable/Not sure",
    noProductNameText: "Product"
  },
  es: {
    reportTitle: "Informe de Evaluación de Sostenibilidad",
    detailedResponses: "Respuestas Detalladas",
    categoryScores: "Resultados por Categoría",
    page: "Página",
    skippedQuestionText: "Not aplica/No sabe",
    noProductNameText: "Producto"
  }
};
