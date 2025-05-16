from app.core.config import Settings
from app.utils.report_generator import ReportGenerator
from app.utils.text_processing import paginate_html_text, paginate_html_tables
import os
import datetime
settings = Settings()



def test_report_image():

    generator = ReportGenerator()

    logo2 = os.path.join(settings.LOGOS_DIR, "report_26_logo_d5fe202e-7a96-44e0-8748-28d05a204ca9.jpg")

    
    
    # Texto con imagenes: pages = paginate_html_text(stakeholder_text["text"], max_lines=40, chars_per_line=35)

    data = ""
    for page in pages:
        data += generator.generate_simple_text({"title": "", "text": page}, "#FFF")

    combined_html = generator.generate_simple(data)
    
    
    # Guardar el reporte combinado como HTML
    html_path = os.path.join(settings.REPORTS_DIR, "prueba_imagen.html")
    with open(html_path, "w", encoding="utf-8") as file:
        file.write(combined_html)
    
    print(f"Reporte HTML generado en: {html_path}")



        

def test_report_generation():
    
    
    # Apartados: 
    
    # 1. Portada, Categorización, Carta de compromiso Misión, Visión, Valores, Normativa Equipo de sostenibilidad, organigrama (imagen y texto)
    # 2. Definiendo prioridades: Diagnóstico: Analisis de grupos de interés (texto, descripción de los grupos de interés, clasificación de los grupos de interes), Descripción del diagnóstico, Entender los ODS, Asuntos de materialidad, Impactos principales y secundarios (tablas y gráficos), matriz de materialidad (texto y tabla), Tablas con indicadores de diagnóstico (texto y tablas)
    # 3. Estableciendo objetivos: Hoja de ruta: descripción, Plan de acción: descripción: contexto y periodo temporal, tabla hoja de ruta (sin responsable),  Coherencia interna: descripción, tabla de coherencia de correspondecia y grafica.
    # 4. Integrando: descripción, tabla hoja de ruta con responsable.
    # 5. Informando y comunicando: Difusión: descripción, internacional, estatal, regional, provincial. Colaboradores, bibliografía, galeria fotográfica. 



    PAGE_COLORS = {
        1: {"dark": "#a8d4ec", "light": "#f0f4fc"},
        2: {"dark": "#a8cc54", "light": "#f0f4e4"},
        3: {"dark": "#f8b4c4", "light": "#ffecf4"},
        4: {"dark": "#b0acd4", "light": "#e8e4f4"},
        5: {"dark": "#ffc48c", "light": "#fff4ec"},
    }
    
    

    
    

    # Crear instancia del generador
    generator = ReportGenerator()
    

    #----------------------------PASO 1--------------------------------#


    #-----------------------------------------------------------------#
    
    # PORTADA
    cover_image = os.path.join(settings.COVERS_DIR, "report_26_cover_4072528b-5d1c-471a-a916-754fde0d4dc6.jpg")

    # LOGOS
    logo1 = os.path.join(settings.LOGOS_DIR, "report_5_logo_9b749bc4-2d5a-4410-8d8d-c6112131e8b6.jpg")
    
    logo2 = os.path.join(settings.LOGOS_DIR, "report_5_logo_74d82581-240e-4881-a2d7-7b010c9e4cbb.jpg")
    
    cover_data = {
        "title": "Memoria de Sostenibilidad de la Mezquita-Catedral de Córdoba",
        "cover_image": cover_image,
        "logos": [logo1, logo2],
        "year": "2024"
    }
    
    cover_html = generator.generate_cover(cover_data)

    #-----------------------------------------------------------------#

    # CATEGORIZACIÓN


    # Obtener la fecha actual en formato 'día de mes de año'# Obtener la fecha actual en formato 'día de mes de año'
    
    

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

    resource_html = generator.generate_resource_info(resource_data)

    #-----------------------------------------------------------------#

    # CARTA DE COMPROMISO

    # Prueba de página de texto simple
    commitment_letter_text = {
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

    
    # Paginar el texto simple
    pages = paginate_html_text(commitment_letter_text["text"], max_lines=60, chars_per_line=35)
    commitment_letter_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            commitment_letter_html += generator.generate_simple_text({"title": commitment_letter_text["title"], "text": page}, PAGE_COLORS[1]["light"])
        else:
            commitment_letter_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[1]["light"])

    #-----------------------------------------------------------------#

    # MISIÓN

    mission_text = {
        "title": "Misión",
        "text": """
            <p>La misión de la Mezquita-Catedral de Córdoba es preservar, difundir y promover el legado histórico, cultural y espiritual de un monumento único en el mundo, símbolo de convivencia y encuentro entre culturas. Como testigo excepcional de la historia de Al-Ándalus y del cristianismo, nuestro compromiso es garantizar la conservación del patrimonio arquitectónico, artístico y religioso, asegurando su integridad para las generaciones presentes y futuras.</p>

            <p>Asimismo, buscamos fomentar el conocimiento y la educación sobre la rica diversidad cultural y religiosa que conforma su esencia, ofreciendo a visitantes, fieles e investigadores un espacio de reflexión, respeto y diálogo intercultural. Todo ello, con un enfoque sostenible y responsable, contribuyendo al desarrollo cultural, social y económico de Córdoba y su entorno.</p>
        """
    }
    
    pages = paginate_html_text(mission_text["text"], max_lines=60, chars_per_line=35)
    mission_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            mission_html += generator.generate_simple_text({"title": mission_text["title"], "text": page}, PAGE_COLORS[1]["light"])
        else:
            mission_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[1]["light"])


    #-----------------------------------------------------------------#

    # VISIÓN

    vision_text = {
        "title": "Visión",
        "text": """
            <p>Ser un referente global en la preservación, interpretación y difusión del patrimonio cultural y religioso, consolidándose como un espacio emblemático de convivencia y diálogo entre culturas. Aspiramos a ser un modelo en la gestión sostenible del patrimonio histórico, integrando la innovación tecnológica y el respeto medioambiental para garantizar su conservación a largo plazo.</p>

            <p>Queremos inspirar a visitantes y comunidades a través de experiencias educativas y espirituales que promuevan el entendimiento mutuo, el respeto por la diversidad cultural y la reflexión sobre el legado histórico de la Mezquita-Catedral, contribuyendo al posicionamiento de Córdoba como un epicentro cultural y espiritual en el ámbito internacional.</p>
        """
    }

    pages = paginate_html_text(vision_text["text"], max_lines=60, chars_per_line=35)
    vision_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            vision_html += generator.generate_simple_text({"title": vision_text["title"], "text": page}, PAGE_COLORS[1]["light"])
        else:
            vision_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[1]["light"])

    #-----------------------------------------------------------------#

    # VALORES

    values_text = {
        "title": "Valores",
        "text": """
            <ol>
                <li>
                    <h3>Patrimonio y Conservación</h3>
                    <p>Preservamos y protegemos el legado arquitectónico, artístico y espiritual de la Mezquita-Catedral, asegurando su integridad para las generaciones presentes y futuras.</p>
                </li>
                <li>
                    <h3>Diversidad y Diálogo Intercultural</h3>
                    <p>Fomentamos el respeto y el entendimiento entre culturas, reconociendo el carácter único de la Mezquita-Catedral como un símbolo de convivencia histórica.</p>
                </li>
                <li>
                    <h3>Sostenibilidad y Responsabilidad</h3>
                    <p>Gestionamos nuestros recursos de forma responsable, aplicando prácticas sostenibles que contribuyan al equilibrio medioambiental y al desarrollo local.</p>
                </li>
                <li>
                    <h3>Excelencia y Profesionalidad</h3>
                    <p>Nos comprometemos a ofrecer un servicio de alta calidad a visitantes, fieles e investigadores, garantizando experiencias enriquecedoras y seguras.</p>
                </li>
                <li>
                    <h3>Educación y Difusión Cultural</h3>
                    <p>Promovemos el conocimiento del patrimonio a través de programas educativos, actividades culturales y proyectos de investigación que destacan la riqueza histórica del monumento.</p>
                </li>
                <li>
                    <h3>Espiritualidad y Reflexión</h3>
                    <p>Respetamos y promovemos el carácter espiritual del monumento, ofreciendo un espacio de recogimiento, fe y reflexión para personas de todas las creencias.</p>
                </li>
                <li>
                    <h3>Integridad y Transparencia</h3>
                    <p>Actuamos con ética, transparencia y rigor en la gestión del patrimonio, comprometidos con el cumplimiento de nuestras responsabilidades institucionales y sociales.</p>
                </li>
            </ol>
        """
    }

    pages = paginate_html_text(values_text["text"], max_lines=30, chars_per_line=60)
    values_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            values_html += generator.generate_simple_text({"title": values_text["title"], "text": page}, PAGE_COLORS[1]["light"])
        else:
            values_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[1]["light"])
    #-----------------------------------------------------------------#

    # NORMATIVA 

    normative_text = [
        "Normativa 1: Mantener un comportamiento respetuoso en todo momento dentro del recinto, evitando ruidos innecesarios y conductas inapropiadas. google.com",
        "Normativa 2: Está prohibido el uso de dispositivos móviles en áreas de oración y zonas de recogimiento espiritual.",
        "Normativa 3: No se permite el acceso a visitantes con vestimenta inapropiada que no respete la solemnidad del lugar.",
        "Normativa 4: Queda estrictamente prohibido el consumo de alimentos y bebidas en el interior del monumento.",
        "Normativa 5: Las visitas guiadas deben seguir los itinerarios establecidos para garantizar la conservación del patrimonio.",
        "Normativa 6: Cualquier actividad comercial o promocional en el recinto deberá contar con autorización previa de la administración.",
        "Normativa 7: No está permitido el uso de flashes fotográficos ni trípodes para preservar el entorno histórico y evitar distracciones a los visitantes.",
        "Normativa 8: Los grupos de más de 10 personas deben coordinar su visita con el departamento de visitas para evitar aglomeraciones.",
        "Normativa 9: Está prohibido tocar los elementos arquitectónicos y decorativos para evitar su deterioro.",
        "Normativa 10: Se prohíbe el acceso a mascotas, salvo perros guía debidamente identificados.",
        "Normativa 11: Los visitantes deben respetar las indicaciones del personal de seguridad y guías en todo momento.",
        "Normativa 12: La realización de eventos o celebraciones religiosas deberá ser previamente aprobada por la autoridad eclesiástica.",
        "Normativa 13: Los visitantes deben depositar los residuos en los puntos habilitados para mantener la limpieza del entorno.",
        "Normativa 14: Está prohibido el acceso a áreas restringidas señalizadas como privadas o en restauración.",
        "Normativa 15: El uso de drones está estrictamente prohibido sin previa autorización de la administración del monumento."

    ]

    normative_list_html = generator.generate_list_text({"items": normative_text})
    pages = paginate_html_text(normative_list_html, max_lines=60, chars_per_line=35)
    normative_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            normative_html += generator.generate_simple_text({"title": "Normativa", "text": page}, PAGE_COLORS[1]["light"])
        else:
            normative_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[1]["light"])



    #-----------------------------------------------------------------#

    # EQUIPO DE SOSTENIBILIDAD y ORGANIGRAMA

    sustainability_team_text = {
        "title": "Equipo de Sostenibilidad",
        "text": """
            <p>El equipo de sostenibilidad de la Mezquita-Catedral de Córdoba está formado por:</p>
            <ul>
                <li>Ana Pérez García</li>
                <li>Juan García Pérez</li>
                <li>Ana Pérez García</li>
                <li>Juan García Pérez</li>
                <li>Ana Pérez García</li>
            </ul>
        """
    }

    pages = paginate_html_text(sustainability_team_text["text"], max_lines=60, chars_per_line=35)
    sustainability_team_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            sustainability_team_html += generator.generate_simple_text({"title": sustainability_team_text["title"], "text": page}, PAGE_COLORS[1]["light"])
        else:
            sustainability_team_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[1]["light"])



    #-----------------------------------------------------------------#


    #----------------------------PASO 2--------------------------------#

    #-----------------------------------------------------------------#

    # GRUPOS DE INTERÉS: TEXTO, DESCRIPCIÓN, CLASIFICACIÓN

    stakeholder_text = {
        "title": "Análisis de los Grupos de Interés",
        "text": """
            <p>Los grupos de interés de la Mezquita-Catedral de Córdoba son:</p>
            <ul>
                <li> Internos
                    <ul>
                        <li>Grupo 1: lo describo como un grupo de interés interno</li>
                        <li>Grupo 2: lo describo como un grupo de interés interno</li>
                        <li>Grupo 3: lo describo como un grupo de interés interno</li>
                        <li>Grupo 4: lo describo como un grupo de interés interno</li>
                        <li>Grupo 5: lo describo como un grupo de interés interno</li>
                    </ul>
                </li>
                <li>Externos
                    <ul>
                        <li>Grupo 1: lo describo como un grupo de interés externo</li>
                        <li>Grupo 2: lo describo como un grupo de interés externo</li>
                        <li>Grupo 3: lo describo como un grupo de interés externo</li>
                        <li>Grupo 4: lo describo como un grupo de interés externo</li>
                        <li>Grupo 5: lo describo como un grupo de interés externo</li>
                    </ul>
                </li>
            </ul>
            <p> 
        """
    }
    
    pages = paginate_html_text(stakeholder_text["text"], max_lines=60, chars_per_line=35)
    stakeholder_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            stakeholder_html += generator.generate_simple_text({"title": stakeholder_text["title"], "text": page}, PAGE_COLORS[2]["light"])
        else:
            stakeholder_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[2]["light"])

    #-----------------------------------------------------------------#

    # DESCRIPCIÓN DEL DIAGNÓSTICO

    diagnosis_text = {
        "title": "Descripción del Diagnóstico",
        "text": """
            <p>El apartado de diagnostico consiste en un análisis de los grupos de interés y de los asuntos de materialidad, para ello se ha realizado una autoevaluación de los impactos actuales, potenciales, positivos y negativos del recurso sobre los ODS. Esto permitirá reducir o eliminar los impactos negativos y maximizar los impactos positivos en el planeta y las personas.</p>
        """
    }

    pages = paginate_html_text(diagnosis_text["text"], max_lines=60, chars_per_line=35)
    diagnosis_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            diagnosis_html += generator.generate_simple_text({"title": diagnosis_text["title"], "text": page}, PAGE_COLORS[2]["light"])
        else:
            diagnosis_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[2]["light"])

    #-----------------------------------------------------------------#

    # ODS Y DIMENSIONES

    ods_images = get_ods_images_dict(settings.IMAGES_DIR)
    

    ods_dimensions_data = {
        'ods': ods_images
    }
    
    ods_dimensions_html = generator.generate_ods_dimensions_text(ods_dimensions_data)
    

    #-----------------------------------------------------------------#

    # ASUNTOS DE MATERIALIDAD

    # Ejemplo de asuntos de materialidad
    material_topics = [
        {
            "title": "Conservación del Patrimonio",
            "description": "Mantenimiento y conservación del edificio histórico y sus elementos artísticos para garantizar su preservación para las generaciones futuras.",
            "dimension": "PLANETA"
        },
        {
            "title": "Accesibilidad Universal",
            "description": "Mejora de la accesibilidad física y sensorial para todos los visitantes, incluyendo personas con discapacidad.",
            "dimension": "PERSONAS"
        },
        {
            "title": "Eficiencia Energética",
            "description": "Implementación de medidas para reducir el consumo energético y promover el uso de energías renovables.",
            "dimension": "PLANETA"
        },
        {
            "title": "Desarrollo Local",
            "description": "Contribución al desarrollo económico local a través del turismo sostenible y la creación de empleo.",
            "dimension": "PROSPERIDAD"
        },
        {
            "title": "Educación Patrimonial",
            "description": "Programas educativos para promover el conocimiento y valoración del patrimonio cultural.",
            "dimension": "PERSONAS"
        },
        {
            "title": "Educación Patrimonial",
            "description": "Programas educativos para promover el conocimiento y valoración del patrimonio cultural.",
            "dimension": "PERSONAS"
        },
        {
            "title": "Educación Patrimonial",
            "description": "Programas educativos para promover el conocimiento y valoración del patrimonio cultural.",
            "dimension": "PERSONAS"
        },
        {
            "title": "Educación Patrimonial",
            "description": "Programas educativos para promover el conocimiento y valoración del patrimonio cultural.",
            "dimension": "PERSONAS"
        },
        {
            "title": "Gestión de Residuos",
            "description": "Implementación de sistemas de gestión de residuos y reciclaje en las instalaciones.",
            "dimension": "PLANETA"
        },
        {
            "title": "Participación Comunitaria",
            "description": "Fomento de la participación de la comunidad local en la gestión y conservación del patrimonio.",
            "dimension": "ALIANZAS"
        },
        {
            "title": "Seguridad y Protección",
            "description": "Mantenimiento de sistemas de seguridad y protección del patrimonio contra posibles amenazas.",
            "dimension": "PAZ"
        },
        {
            "title": "Innovación Tecnológica",
            "description": "Implementación de tecnologías innovadoras para la conservación y difusión del patrimonio.",
            "dimension": "PROSPERIDAD"
        },
        {
            "title": "Gestión del Agua",
            "description": "Optimización del consumo de agua y sistemas de gestión sostenible del recurso hídrico.",
            "dimension": "PLANETA"
        }
    ]

    material_topics_intro_text = {
        "title": "Asuntos de Materialidad",
        "text": f"        <p>No todos los 17 ODS son importantes en igual medida para este recurso patrimonial. Su grado de contribución a cada ODS, y los desafíos y oportunidades que representan de forma individual, dependen de muchos factores. Para ello, en primer lugar se ha realizado un diagnóstico de alineación con la sostenibilidad mediante una autoevaluación de los impactos actuales, potenciales, positivos y negativos del recurso sobre los ODS. Esto permitirá reducir o eliminar los impactos negativos y maximizar los impactos positivos en el planeta y las personas.</p>         <p>Un análisis de materialidad es una herramienta clave para lograr que nuestro recurso patrimonial sea sostenible y responsable en la toma de decisiones. Nos permite identificar los asuntos relevantes para nuestro equipo de sostenibilidad y nuestros grupos de interés. Debemos establecer prioridades e indicadores de rendimiento para medir y monitorear nuestro progreso en sostenibilidad.</p>        <p>Primeramente se han identificado {len(material_topics)} asuntos relevantes, de acuerdo con el equipo de sostenibilidad del recurso y consensuado con los grupos de interés del mismo.</p>"}
    
    # Generar los asuntos de materialidad y paginarlos
    material_topics_html = generator.generate_material_topics_text(material_topics_intro_text, material_topics)
    material_topics_pages = paginate_html_text(material_topics_html, max_lines=45, chars_per_line=60)
    material_topics_html = ""
    for page, i in zip(material_topics_pages, range(1, len(material_topics_pages) + 1)):
        if i == 1:
            material_topics_html += generator.generate_simple_text({"title": "Asuntos de Materialidad", "text": page}, PAGE_COLORS[2]["light"])
        else:
            material_topics_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[2]["light"])

    #-----------------------------------------------------------------#

    # IMPACTOS PRINCIPALES Y SECUNDARIOS (TABLAS Y GRÁFICOS)

    main_secondary_impact_text = {
        "title": "Impactos Principales y Secundarios",
        "text": """
            <p>Los impactos principales y secundarios son los impactos que el recurso patrimonial tiene sobre los ODS.</p>
        """
    }

    diagnosis_tables_data = {
        "material_topics": [
            {
                "dimension": "Planeta",
                "topic": "Eficiencia energética",
                "main_ODS": "ODS 7 - Energía asequible y no contaminante",
                "main_ODS_goal": "7.2 - Aumentar la proporción de energía renovable",
                "secondary_ODS": [
                    "ODS 13 - Acción por el clima"
                ],
                "qualitative_indicators": [
                    {"name": "¿Se usan energías renovables?", "response": "Sí, paneles solares instalados."}
                ],
                "quantitative_indicators": [
                    {"name": "Consumo energético anual", "response": "12000", "unit": "kWh"}
                ]
            },
            {
                "dimension": "Personas",
                "topic": "Difusión y sensibilización",
                "main_ODS": "ODS 4 - Educación de calidad",
                "main_ODS_goal": "4.7 - Educación para el desarrollo sostenible",
                "secondary_ODS": [
                    "ODS 5 - Igualdad de género",
                    "ODS 10 - Reducción de las desigualdades",
                    "ODS 10 - Reducción de las desigualdades",
                    "ODS 10 - Reducción de las desigualdades",
                    "ODS 10 - Reducción de las desigualdades",
                    "ODS 10 - Reducción de las desigualdades",
                    "ODS 10 - Reducción de las desigualdades",
                    "ODS 10 - Reducción de las desigualdades"
                ],
                "qualitative_indicators": [
                    {"name": "¿El recurso cuenta con algún reconocimiento?", "response": "Sí, reconocimiento local."},
                    {"name": "¿El recurso cuenta con algún reconocimiento?", "response": "Sí, reconocimiento local."},
                    {"name": "¿El recurso cuenta con algún reconocimiento?", "response": "Sí, reconocimiento local."},
                    {"name": "¿El recurso cuenta con algún reconocimiento?", "response": "Sí, reconocimiento local."},
                    {"name": "¿Se actualizan los contenidos?", "response": "Anualmente se actualizan los contenidos."}
                ],
                "quantitative_indicators": [
                    {"name": "Número de actividades realizadas", "response": "15", "unit": "actividades"},
                    {"name": "Número de personas participantes", "response": "300", "unit": "personas"},
                    {"name": "Número de personas participantes", "response": "300", "unit": "personas"},
                    {"name": "Número de personas participantes", "response": "300", "unit": "personas"},
                    {"name": "Número de personas participantes", "response": "300", "unit": "personas"}
                ]
            },
            
        ]
    }
    
    main_secondary_impact_tables_text_html = generator.generate_diagnosis_tables(diagnosis_tables_data, show_indicators=False, introduction_text=main_secondary_impact_text["text"])
    pages = paginate_html_tables(main_secondary_impact_tables_text_html, max_lines=53)
    main_secondary_impact_tables_text_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:

            main_secondary_impact_tables_text_html += generator.generate_simple_text({"title": main_secondary_impact_text["title"], "text": page}, PAGE_COLORS[2]["light"])
        else:
            main_secondary_impact_tables_text_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[2]["light"])

    # FALTA: grafico de impactos principales y secundarios

    #-----------------------------------------------------------------#

    # MATRIZ DE MATERIALIDAD (TEXTO Y GRAFICO)

    materiality_matrix_text = {
        "title": "Matriz de Materialidad",
        "text": """
            <p>La matriz de materialidad es una herramienta que permite identificar los asuntos de materialidad relevantes para el recurso patrimonial y su alineación con los ODS.</p>
        """
    }

    pages = paginate_html_text(materiality_matrix_text["text"], max_lines=45, chars_per_line=60)
    materiality_matrix_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            materiality_matrix_html += generator.generate_simple_text({"title": materiality_matrix_text["title"], "text": page}, PAGE_COLORS[2]["light"])
        else:
            materiality_matrix_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[2]["light"])

    # FALTA: grafico de matriz de materialidad

    #-----------------------------------------------------------------#

    # INDICADORES DE DIAGNÓSTICO (TEXTO Y TABLAS)

    

    diagnosis_tables_html = generator.generate_diagnosis_tables(diagnosis_tables_data, show_indicators=True)
    pages = paginate_html_tables(diagnosis_tables_html, max_lines=53)
    diagnosis_tables_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            diagnosis_tables_html += generator.generate_simple_text({"title": "Indicadores de Diagnóstico", "text": page}, PAGE_COLORS[2]["light"])
        else:
            diagnosis_tables_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[2]["light"])


    #----------------------------PASO 3--------------------------------#

    #-----------------------------------------------------------------#

    # HOJA DE RUTA (DESCRIPCIÓN)

    roadmap_text = {
        "title": "Hoja de Ruta",
        "text": """
            <p>La hoja de ruta es una herramienta que permite identificar los asuntos de materialidad relevantes para el recurso patrimonial y su alineación con los ODS.</p>
        """
    }   

    pages = paginate_html_text(roadmap_text["text"], max_lines=60, chars_per_line=35)
    roadmap_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            roadmap_html += generator.generate_simple_text({"title": roadmap_text["title"], "text": page}, PAGE_COLORS[3]["light"])
        else:
            roadmap_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[3]["light"])



    #-----------------------------------------------------------------#

    # PLAN DE ACCIÓN (DESCRIPCIÓN, CONTEXTO Y PERIODO TEMPORAL, TABLA SIN RESPONSABLE)

    action_plan_data = {
        "action_plan": [
            {
                "dimension": "Personas",
                "topic": "Difusión y sensibilización",
                "priority": "Alta",
                "main_objective": "Fomentar la educación y el conocimiento sobre el recurso patrimonial",
                "specific_objectives": [
                    {
                        "objective": "Aumentar la participación de la comunidad escolar",
                        "responsible": "Departamento de Educación",
                        "execution_time": "2024-2025",
                        "actions": [
                            {
                                "action": "Organizar visitas guiadas para colegios",
                                "difficulty": "Media",
                                "main_ODS": "ODS 4 - Educación de calidad",
                                "secondary_ODS": [
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                ],
                                "indicators": [
                                    {
                                        "name": "Número de visitas realizadas",
                                        "type": "Cuantitativo",
                                        "human_resources": "Guías educativos",
                                        "material_resources": "Folletos, transporte"
                                    },
                                    {
                                        "name": "Satisfacción de los participantes",
                                        "type": "Cualitativo",
                                        "human_resources": "Encuestadores",
                                        "material_resources": "Cuestionarios"
                                    }
                                ]
                            },
                            {
                                "action": "Desarrollar material didáctico",
                                "main_ODS": "ODS 4 - Educación de calidad",
                                "secondary_ODS": [
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                ],
                                "difficulty": "Alta",
                                "indicators": [
                                    {
                                        "name": "Materiales creados",
                                        "type": "Cuantitativo",
                                        "human_resources": "Equipo pedagógico",
                                        "material_resources": "Impresora, papel"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "objective": "Mejorar la accesibilidad de la información",
                        "responsible": "Equipo de Comunicación",
                        "execution_time": "2024",
                        "actions": [
                            {
                                "action": "Actualizar la web con recursos accesibles",
                                "difficulty": "Baja",
                                "main_ODS": "ODS 4 - Educación de calidad",
                                "secondary_ODS": [
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                    "ODS 10 - Reducción de las desigualdades",
                                ],
                                "indicators": [
                                    {
                                        "name": "Web accesible publicada",
                                        "type": "Cuantitativo",
                                        "human_resources": "Desarrollador web",
                                        "material_resources": "Software de desarrollo"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }

    action_plan_html = generator.generate_action_plan_tables(action_plan_data, show_indicators=True, show_responsible=False)
    pages = paginate_html_tables(action_plan_html, max_lines=53)
    
    action_plan_tables_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            action_plan_tables_html += generator.generate_simple_text({"title": "Plan de Acción", "text": page}, PAGE_COLORS[3]["light"])
        else:
            action_plan_tables_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[3]["light"])


    action_plan_description_text = {
        "title": "Plan de Acción",
        "text": """
            <p>El plan de acción es una herramienta que permite identificar los asuntos de materialidad relevantes para el recurso patrimonial y su alineación con los ODS.</p>
        """
    }

    
    pages = paginate_html_text(action_plan_description_text["text"], max_lines=60, chars_per_line=35)
    action_plan_description_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            action_plan_description_html += generator.generate_simple_text({"title": action_plan_description_text["title"], "text": page}, PAGE_COLORS[3]["light"])
        else:
            action_plan_description_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[3]["light"])

    context_period_text = {
        "title": "Contexto y Periodo Temporal",
        "text": """
            <p>El contexto y el periodo temporal son los contextos y periodos temporales en los que se desarrolla el plan de acción.</p>
        """
    }

    
    pages = paginate_html_text(context_period_text["text"], max_lines=60, chars_per_line=35)
    context_period_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            context_period_html += generator.generate_simple_text({"title": context_period_text["title"], "text": page}, PAGE_COLORS[3]["light"])
        else:
            context_period_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[3]["light"])


    #-----------------------------------------------------------------#

    # COHERENCIA INTERNA (DESCRIPCIÓN, TABLA DE COHERENCIA DE IMPACTO ODS A ACCIÓN Y GRAFICO)


    internal_consistency_intro_text = {
        "title": "Coherencia Interna",
        "text": """
            <p>La coherencia interna es la coherencia interna del plan de acción.</p>
        """
    }

    
    pages = paginate_html_text(internal_consistency_intro_text["text"], max_lines=60, chars_per_line=35)
    internal_consistency_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            internal_consistency_html += generator.generate_simple_text({"title": internal_consistency_intro_text["title"], "text": page}, PAGE_COLORS[3]["light"])
        else:
            internal_consistency_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[3]["light"])
    

    action_main_secondary_impacts_html = generator.generate_action_plan_tables(action_plan_data, show_indicators=False, show_responsible=False)
    pages = paginate_html_tables(action_main_secondary_impacts_html, max_lines=45)
    action_main_secondary_impacts_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            action_main_secondary_impacts_html += generator.generate_simple_text({"title": "Coherencia Interna", "text": page}, PAGE_COLORS[3]["light"])
        else:
            action_main_secondary_impacts_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[3]["light"])

    # FALTA: grafico de coherencia interna y si necesitase texto introducción


    #----------------------------PASO 4--------------------------------#

    #-----------------------------------------------------------------#

    # INTEGRANDO (DESCRIPCIÓN, TABLA HOJA DE RUTA CON RESPONSABLE)

    integrating_text = {
        "title": "Integrando",
        "text": """
            <p>La integración es la integración del plan de acción. Es decir, se integra el plan de acción con el plan de acción. este apartado se encarga de integrar el plan de acción con el plan de acción.</p>
        """
    }

    
    pages = paginate_html_text(integrating_text["text"], max_lines=60, chars_per_line=35)
    integrating_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            integrating_html += generator.generate_simple_text({"title": integrating_text["title"], "text": page}, PAGE_COLORS[4]["light"])
        else:
            integrating_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[4]["light"])


    action_plan_html = generator.generate_action_plan_tables(action_plan_data, show_indicators=True, show_responsible=True)
    pages = paginate_html_tables(action_plan_html, max_lines=53)    
    integrating_action_plan_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            integrating_action_plan_html += generator.generate_simple_text({"title": "Tablas de Integración de responsable en Plan de Acción", "text": page}, PAGE_COLORS[4]["light"])
        else:
            integrating_action_plan_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[4]["light"])

    #----------------------------PASO 5--------------------------------#

    #-----------------------------------------------------------------#

    # DIFUSIÓN (DESCRIPCIÓN, INTERNACIONAL, ESTATAL, REGIONAL, PROVINCIAL)

    diffusion_text = {
        "title": "Difusión",
        "text": """
            <p>La difusión es la difusión del plan de acción. Es decir, se difunde el plan de acción. este apartado se encarga de difundir el plan de acción.</p>
        """
    }

    
    pages = paginate_html_text(diffusion_text["text"], max_lines=60, chars_per_line=35)
    diffusion_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            diffusion_html += generator.generate_simple_text({"title": diffusion_text["title"], "text": page}, PAGE_COLORS[5]["light"])
        else:
            diffusion_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[5]["light"])

    #-----------------------------------------------------------------#

    # COLABORADORES

    agreements_list = [
        "Acuerdo de colaboración con la Universidad de Córdoba",
        "Acuerdo de colaboración con la Universidad de Córdoba",
        "Acuerdo de colaboración con la Universidad de Córdoba",
        "Acuerdo de colaboración con la Universidad de Córdoba",
        "Acuerdo de colaboración con la Universidad de Córdoba",
        "Acuerdo de colaboración con la Universidad de Córdoba",
        "Acuerdo de colaboración con la Universidad de Córdoba",
    ]

    agreements_html = generator.generate_list_text({"items": agreements_list})
    pages = paginate_html_text(agreements_html, max_lines=60, chars_per_line=35)
    agreements_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            agreements_html += generator.generate_simple_text({"title": "Colaboradores", "text": page}, PAGE_COLORS[5]["light"])
        else:
            agreements_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[5]["light"])
    #-----------------------------------------------------------------#

    # BIBLIOGRAFÍA

    bibliography_list = [
        "Bibliografía 1",
        "Bibliografía 2",
        "Bibliografía 3",
        "Bibliografía 4",
        "Bibliografía 5",
    ]

    bibliography_html = generator.generate_list_text({"items": bibliography_list})
    pages = paginate_html_text(bibliography_html, max_lines=60, chars_per_line=35)
    bibliography_html = ""
    for page,i in zip(pages, range(1, len(pages) + 1)):
        if i == 1:
            bibliography_html += generator.generate_simple_text({"title": "Bibliografía", "text": page}, PAGE_COLORS[5]["light"])
        else:
            bibliography_html += generator.generate_simple_text({"title": "", "text": page}, PAGE_COLORS[5]["light"])
    #-----------------------------------------------------------------#

    # GALERÍA FOTOGRÁFICA



    #-----------------------------------------------------------------#

    # IMPORTANTE "organization_chart_html": organization_chart_html,

    data = {
        "cover_html": cover_html,
        "resource_html": resource_html,
        "commitment_letter_html": commitment_letter_html,
        "mission_html": mission_html,
        "vision_html": vision_html,
        "values_html": values_html,
        "normative_html": normative_html,
        "sustainability_team_html": sustainability_team_html,

        "stakeholder_html": stakeholder_html,
        "diagnosis_html": diagnosis_html,
        "ods_dimensions_html": ods_dimensions_html,
        "material_topics_html": material_topics_html,
        "main_secondary_impact_tables_text_html": main_secondary_impact_tables_text_html,
        "materiality_matrix_html": materiality_matrix_html,
        "diagnosis_tables_html": diagnosis_tables_html,

        "roadmap_html": roadmap_html,
        "action_plan_description_html": action_plan_description_html,
        "context_period_html": context_period_html,
        "action_plan_tables_html": action_plan_tables_html,
        "internal_consistency_html": internal_consistency_html,
        "action_main_secondary_impacts_html": action_main_secondary_impacts_html,

        "integrating_html": integrating_html,
        "integrating_action_plan_html": integrating_action_plan_html,
        "diffusion_html": diffusion_html,
        "agreements_html": agreements_html,
        "bibliography_html": bibliography_html,
        
    }
    
    combined_html = generator.generate_combined_html(data)
    
    
    # Guardar el reporte combinado como HTML
    html_path = os.path.join(settings.REPORTS_DIR, "memoria_sostenibilidad_mezquita.html")
    with open(html_path, "w", encoding="utf-8") as file:
        file.write(combined_html)
    
    print(f"Reporte HTML generado en: {html_path}")
    print("\nPara ver el reporte, abre el archivo HTML en tu navegador.")
    print("Para descargar el PDF, haz clic en el botón 'Descargar PDF' en la esquina superior derecha.")


if __name__ == "__main__":
    test_report_generation() 