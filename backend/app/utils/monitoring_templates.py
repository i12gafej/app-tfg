import logging

# Configurar logger
logger = logging.getLogger(__name__)

def generate_monitoring_template(material_topics):
    logger.info("Iniciando generación de plantilla HTML")
    try:
        html_template = """
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ficha de seguimiento</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #eaf3f9;
                    padding: 40px;
                    color: #000;
                }
                .container {
                    background-color: #f0f8ff;
                    padding: 40px;
                    border-radius: 10px;
                    max-width: 800px;
                    margin: auto;
                }
                h1, h2, h3 {
                    margin: 0;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                label {
                    font-weight: bold;
                    display: block;
                    margin-bottom: 5px;
                }
                textarea, input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #cde4f5;
                    border-radius: 5px;
                    background-color: white;
                }
                .flex-row {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .flex-row .form-group {
                    flex: 1;
                }
                .footer {
                    text-align: right;
                    font-size: 0.9em;
                    margin-top: 40px;
                }
                .page-break {
                    page-break-after: always;
                }
                .button-container {
                    text-align: center;
                    margin: 20px 0;
                }
                button {
                    background-color: #2c5282;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div id="contenido">
        """

        logger.info(f"Procesando {len(material_topics)} asuntos relevantes")
        # Generar una página por cada acción
        for topic in material_topics:
            logger.debug(f"Procesando asunto de materialidad: {topic['name']}")
            for objective in topic['objectives']:
                logger.debug(f"Procesando objetivo: {objective['description']}")
                for action in objective['actions']:
                    logger.debug(f"Procesando acción: {action['description']}")
                    try:
                        # Preparar los indicadores como una lista separada por comas
                        indicators_text = ', '.join([ind['name'] for ind in action['indicators']])
                        
                        html_template += f"""
                        <div class="container">
                            <div class="header">
                                <div>
                                    <strong>Guía para la acción</strong> del recurso patrimonial en los ODS
                                </div>
                                <div>
                                    patrimonio2030.org
                                </div>
                            </div>

                            <h2>Ficha de seguimiento y control de un asunto de materialidad a corto plazo</h2>
                            <p>Ejecucion 1 año</p>

                            <div class="form-group">
                                <label>asunto de materialidad</label>
                                <textarea rows="2">{topic['name']}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Impacto principal ODS</label>
                                <textarea rows="2">{action['main_impact'] or 'No definido'}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Acción</label>
                                <textarea rows="2">{action['description']}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Indicadores de rendimiento</label>
                                <textarea rows="2">{indicators_text}</textarea>
                            </div>

                            <div class="flex-row">
                                <div class="form-group">
                                    <label>Año</label>
                                    <input type="text">
                                </div>
                                <div class="form-group">
                                    <label>Trimestre</label>
                                    <input type="text">
                                </div>
                                <div class="form-group">
                                    <label>Prioridad</label>
                                    <input type="text" value="{topic['priority']}">
                                </div>
                                <div class="form-group">
                                    <label>Dificultad</label>
                                    <input type="text" value="{action['difficulty']}">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Responsable equipo</label>
                                <textarea rows="1">{objective['responsible']}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Objetivo principal</label>
                                <textarea rows="2">{topic['main_objective']}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Objetivo específico</label>
                                <textarea rows="2">{objective['description']}</textarea>
                            </div>

                            <div class="form-group">
                                <label>Resultados</label>
                                <textarea rows="2"></textarea>
                            </div>

                            <div class="form-group">
                                <label>Notas</label>
                                <textarea rows="3"></textarea>
                            </div>

                            <div class="footer">
                                Plantilla de seguimiento y control | 1
                            </div>
                        </div>
                        <div class="page-break"></div>
                        """
                    except Exception as e:
                        logger.error(f"Error al generar HTML para la acción {action['id']}: {str(e)}")
                        logger.error(f"Datos de la acción: {action}")
                        raise

        html_template += """
            </div>
            <div class="button-container">
                <button onclick="guardarComoPDF()">Guardar como PDF</button>
            </div>

            <script>
                function guardarComoPDF() {
                    const element = document.getElementById("contenido");
                    const opt = {
                        margin: 1,
                        filename: 'plantilla_seguimiento.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                    };
                    html2pdf().set(opt).from(element).save();
                }
            </script>
        </body>
        </html>
        """
        
        logger.info("Plantilla HTML generada correctamente")
        return html_template

    except Exception as e:
        logger.error(f"Error al generar plantilla HTML: {str(e)}", exc_info=True)
        raise
