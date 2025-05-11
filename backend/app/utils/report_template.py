import os
from jinja2 import Environment, FileSystemLoader

class HTMLGenerator:
    def __init__(self, output_folder):
        self.output_folder = output_folder
        os.makedirs(self.output_folder, exist_ok=True)
        self.template_env = Environment(loader=FileSystemLoader(searchpath="templates"))

    def generate_html(self, data, filename):
        html_path = os.path.join(self.output_folder, filename)
        template = self.template_env.get_template("template.html")
        rendered_html = template.render(data=data)
        with open(html_path, "w", encoding="utf-8") as file:
            file.write(rendered_html)
        return html_path

if __name__ == "__main__":
    sample_data = {
        "dimensiones": [
            {
                "dimension": "Personas", "asunto": "Difusión y sensibilización", "ods": "ODS 4 - Garantizar una educación inclusiva, equitativa y de calidad", 
                "indicadores_cualitativos": [
                    {"pregunta": "¿El recurso cuenta con algún reconocimiento?", "respuesta": "Sí, reconocimiento local."},
                    {"pregunta": "¿Se llevan a cabo acciones para actualizar los contenidos?", "respuesta": "Anualmente se actualizan los contenidos."}
                ],
                "indicadores_cuantitativos": [
                    {"pregunta": "Número de actividades realizadas", "respuesta": "15"},
                    {"pregunta": "Número de personas participantes", "respuesta": "300"}
                ]
            }
        ]
    }

    # Crear directorio de plantillas
    os.makedirs("templates", exist_ok=True)
    template_content = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Poppins', sans-serif; margin: 40px; background-color: #f4f4f4; }
            .container { background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { background-color: #d4eac7; padding: 10px; font-weight: 600; font-size: 14px; }
            .subheader { background-color: #e1ecf4; padding: 10px; font-weight: 600; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 10px; border: 1px solid #ddd; text-align: left; vertical-align: top; }
            .table th { background-color: #d4eac7; font-weight: 600; }
            .table .category { background-color: #f1f8e9; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 class="header">PATRIMONIO CULTURAL | INDICADORES</h2>

            {% for item in data['dimensiones'] %}
                <table class="table">
                    <tr>
                        <th>Dimensión</th>
                        <td class="subheader">{{ item['dimension'] }}</td>
                    </tr>
                    <tr>
                        <th>Asunto</th>
                        <td>{{ item['asunto'] }}</td>
                    </tr>
                    <tr>
                        <th>Impacto ODS principal</th>
                        <td>{{ item['ods'] }}</td>
                    </tr>
                    <tr>
                        <th colspan="2" class="category">Indicadores cualitativos</th>
                    </tr>
                    {% for indicador in item['indicadores_cualitativos'] %}
                    <tr>
                        <td>{{ indicador['pregunta'] }}</td>
                        <td>{{ indicador['respuesta'] }}</td>
                    </tr>
                    {% endfor %}
                    <tr>
                        <th colspan="2" class="category">Indicadores cuantitativos</th>
                    </tr>
                    {% for indicador in item['indicadores_cuantitativos'] %}
                    <tr>
                        <td>{{ indicador['pregunta'] }}</td>
                        <td>{{ indicador['respuesta'] }}</td>
                    </tr>
                    {% endfor %}
                </table>
            {% endfor %}
        </div>
    </body>
    </html>
    '''

    with open("templates/template.html", "w", encoding="utf-8") as file:
        file.write(template_content)

    generator = HTMLGenerator(output_folder="output")
    generator.generate_html(sample_data, "reporte.html")
