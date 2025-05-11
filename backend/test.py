from app.core.config import Settings
from app.utils.report_generator import ReportGenerator
import os
import datetime

settings = Settings()

def test_report_generation():
    # Crear instancia del generador
    generator = ReportGenerator()
    
    # Construir rutas de las imágenes
    cover_image = os.path.join(settings.COVERS_DIR, "report_5_cover_b5a4e4b3-1357-495b-b28f-bbc9dee2cc0f.jpg")
    logo1 = os.path.join(settings.LOGOS_DIR, "report_5_logo_9b749bc4-2d5a-4410-8d8d-c6112131e8b6.jpg")
    logo2 = os.path.join(settings.LOGOS_DIR, "report_5_logo_74d82581-240e-4881-a2d7-7b010c9e4cbb.jpg")
    
    # Obtener la fecha actual en formato 'día de mes de año'
    meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    hoy = datetime.datetime.now()
    publish_date = f"{hoy.day} de {meses[hoy.month-1]} del {hoy.year}"
    
    # Datos para la portada
    cover_data = {
        "title": "Memoria de Sostenibilidad de la Mezquita-Catedral de Córdoba",
        "cover_image": cover_image,
        "logos": [logo1, logo2],
        "year": "2024"
    }
    
    # Datos para la página de categorización
    resource_data = {
        "name": "Mezquita-Catedral de Córdoba",
        "tipologies": ["Patrimonio Cultural", "Patrimonio Religioso", "Patrimonio Arquitectónico"],
        "ownership": "Cabildo Catedral de Córdoba",
        "management_model": "Híbrido (Público-Privado)",
        "postal_address": "Calle Cardenal Herrero, 1, 14003 Córdoba",
        "website": "https://mezquita-catedraldecordoba.es",
        "phone": "+34 957 47 05 12",
        "social_networks": [
            {
                "name": "Facebook",
                "url": "https://www.facebook.com/mezquitacordoba"
            },
            {
                "name": "Twitter",
                "url": "https://twitter.com/mezquitacordoba"
            },
            {
                "name": "Instagram",
                "url": "https://www.instagram.com/mezquitacordoba"
            }
        ],
        "publish_date": publish_date
    }
    # Prueba de página de texto simple
    simple_text_data = {
        "title": "Carta de compromiso",
        "text": """


            <p>Estimado Sr. Deán-Presidente,</p>
            
            <p>Por medio de la presente, yo, Ana Pérez García, deseo expresar mi profundo respeto y admiración por la Mezquita-Catedral de Córdoba, un monumento que considero un tesoro invaluable para la historia, la cultura y el patrimonio no solo de Córdoba y Andalucía, sino del mundo entero. Reconozco la trascendental importancia de este lugar como testimonio de la convivencia histórica y su actual relevancia como espacio de culto, conservación del patrimonio y promoción cultural. Consciente de la responsabilidad colectiva de preservar y apoyar este emblemático monumento, me comprometo a contribuir de la siguiente manera:</p>
            <ol>
            <li>A visitar y tratar la Mezquita-Catedral con el máximo respeto, siguiendo las normativas establecidas para su conservación y el bienestar de los visitantes y fieles.</li>
            <li>A difundir y promover la riqueza histórica, artística y cultural de la Mezquita-Catedral entre mi círculo personal y a través de los medios a mi alcance.</li>
            <li>A considerar la posibilidad de realizar una donación puntual para contribuir a sus labores de mantenimiento y conservación.</li>
            <li>A mostrar interés en participar en futuras actividades culturales que el Cabildo pudiera organizar.</li>
            </ol>
            <p>Entiendo y apoyo la triple misión de la Mezquita-Catedral como lugar de culto cristiano, espacio de conservación del patrimonio y centro de promoción cultural. Mi compromiso se alinea con el deseo de asegurar que este legado perdure para las generaciones futuras.</p>
            
            
            
            <p>Agradezco de antemano la labor que el Cabildo Catedral realiza en la custodia y promoción de este magnífico monumento. Espero que mi humilde compromiso pueda ser de alguna utilidad para alcanzar sus importantes objetivos.</p>
            
            <p>Quedo a su disposición para cualquier aclaración o colaboración que consideren oportuna.</p>
            <p>Atentamente,</p>
        <p>[Firma Ficticia]</p>
        <p>Ana Pérez García</p>"""
    }

    lista_items = [
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1Item 1 Item 1 https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1 Item 1  https://www.google.com",
        "Item 2",
        "Item 3",
        "Item 4",
        "Item 5"
    ]
    # Paginar el texto simple
    pages = generator.paginate_html_text(simple_text_data["text"], max_lines=60, chars_per_line=35)  # Puedes ajustar el límite
    simple_text_html = ""
    for page in pages:
        simple_text_html += generator.generate_simple_text({"title": simple_text_data["title"], "text": page})
    
    lista_items_html = generator.generate_list_text({"items": lista_items})
    pages = generator.paginate_html_text(lista_items_html, max_lines=60, chars_per_line=40)  # Puedes ajustar el límite
    lista_items_html = ""
    for page in pages:
        lista_items_html += generator.generate_simple_text({"title": "Lista de items", "text": page})

    # Generar las páginas
    cover_html = generator.generate_cover(cover_data)
    resource_html = generator.generate_resource_info(resource_data)
    
    # Combinar las páginas en un solo HTML con todos los estilos
    combined_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Memoria de Sostenibilidad</title>
        <style>
            @page {{
                size: A4;
                margin: 0;
            }}

            body {{
                margin: 0;
                padding: 0;
                font-family: 'Poppins', sans-serif;
                box-sizing: border-box;
            }}

            /* Estilos para el botón de descarga */
            .download-button {{
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #3498db;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
            }}

            .download-button:hover {{
                background-color: #2980b9;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
            }}

            .download-button:active {{
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}

            .download-icon {{
                width: 20px;
                height: 20px;
                fill: currentColor;
            }}


            

            @media print {{
                body, .page {{
                    background-color: #F3DCB8 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }}
                .download-button {{
                    display: none;
                }}
            }}
        </style>
    </head>
    <body>
        <button class="download-button" onclick="window.print()">
            <svg class="download-icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Descargar PDF
        </button>
        {cover_html}
        {resource_html}
        {simple_text_html}
        {lista_items_html}
    </body>
    </html>
    """
    
    # Guardar el reporte combinado como HTML
    html_path = os.path.join(settings.REPORTS_DIR, "memoria_sostenibilidad_mezquita.html")
    with open(html_path, "w", encoding="utf-8") as file:
        file.write(combined_html)
    
    print(f"Reporte HTML generado en: {html_path}")
    print("\nPara ver el reporte, abre el archivo HTML en tu navegador.")
    print("Para descargar el PDF, haz clic en el botón 'Descargar PDF' en la esquina superior derecha.")


if __name__ == "__main__":
    test_report_generation() 