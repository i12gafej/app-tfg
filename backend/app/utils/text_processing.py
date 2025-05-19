from bs4 import BeautifulSoup, Tag

def paginate_html_text(html: str, max_lines: int = 60, chars_per_line: int = 40) -> list:
    """
    Divide el texto HTML en páginas según un límite de líneas virtuales y caracteres por línea,
    agrupando títulos con su contenido y sin dividir el contenido de un <li>.
    Si un <li> contiene tanto un <span> como un <p>, el número de líneas que ocupa se multiplica por 2.
    Ahora también considera bloques de imagen (div.photo-page) con márgenes y caption.
    """
    def count_lines(text):
        # Eliminar espacios en blanco al inicio y final
        text = text.strip()
        # Si el texto está vacío, retornar 0 líneas
        if not text:
            return 0
        # Contar líneas basado en saltos de línea y longitud
        lines = text.split('\n')
        total = 0
        for line in lines:
            line = line.strip()
            if line:
                total += max(1, (len(line) // chars_per_line) + (1 if len(line) % chars_per_line else 0))
        return total

    def get_visual_height(img_tag, max_width_cm=15, max_height_cm=20, dpi=5):
        cm_to_px = dpi / 2.54  # 1 cm ≈ 37.8 px
        max_width = max_width_cm * cm_to_px
        max_height = max_height_cm * cm_to_px

        width_real = int(img_tag.get('width', 400))
        height_real = int(img_tag.get('height', 400))

        scale = min(max_width / width_real, max_height / height_real)
        width_final = width_real * scale
        height_final = height_real * scale
        return height_final

    def image_block_to_lines(img_tag, caption_text=None, px_per_line=20, margin_top=0, margin_bottom=0):
        height_px = get_visual_height(img_tag)
        image_lines = max(1, int(height_px) // px_per_line)
        margin_lines = (margin_top + margin_bottom) // px_per_line
        caption_lines = 0
        if caption_text:
            caption_lines = 2  # O usa count_lines si el caption es largo
        return image_lines + margin_lines + caption_lines

    soup = BeautifulSoup(html, "html.parser")
    blocks = []
    current_page = ""
    current_lines = 0

    def add_page():
        nonlocal current_page, current_lines
        if current_page.strip():
            blocks.append(current_page)
        current_page = ""
        current_lines = 0

    def get_next_block(elems, idx):
        if idx >= len(elems):
            return None, idx
        elem = elems[idx]
        if elem.name and elem.name.lower() in [f"h{i}" for i in range(1, 3)]:
            next_idx = idx + 2
            if next_idx < len(elems):
                return [elem, elems[next_idx]], idx + 2
            else:
                return [elem], idx + 1
        else:
            return [elem], idx + 1

    def block_to_html(block):
        return ''.join(str(e) for e in block)

    def block_line_count(block):
        total = 0
        for e in block:
            if isinstance(e, Tag):
                if e.name == "li":
                    # Siempre cuenta como al menos una línea completa
                    chars = len(e.get_text())
                    has_span = e.find("span") is not None
                    has_p = e.find("p") is not None
                    lines = 1 + (chars // chars_per_line)
                    if has_span and has_p:
                        lines *= 2
                    total += lines
                elif e.name == "p":
                    # Para párrafos, contar líneas basado en el texto
                    text = e.get_text()
                    total += count_lines(text)
                else:
                    total += count_lines(e.get_text())
            else:
                total += count_lines(str(e))
        return total

    elems = [e for e in soup.contents if not (isinstance(e, str) and e.strip() == "")]
    idx = 0
    while idx < len(elems):
        block, idx = get_next_block(elems, idx)
        # --- INICIO: Manejo de bloques de imagen tipo photo-container ---
        if len(block) == 1 and isinstance(block[0], Tag) and block[0].name == "div" and "photo-container" in block[0].get("class", []):
            div = block[0]
            img_tag = div.find("img")
            caption_tag = div.find(class_="photo-caption")
            caption_text = caption_tag.get_text() if caption_tag else None
            lines = image_block_to_lines(
                img_tag,
                caption_text=caption_text,
                px_per_line=5,
                margin_top=20,
                margin_bottom=20
            )
            if current_lines + lines > max_lines and current_page:
                add_page()
            if current_lines == 0:
                current_page += '<div style="height: 20px"></div>'  # o usa <br> si prefieres
    
            current_page += str(div)
            current_lines += lines
            continue
        # --- FIN: Manejo de bloques de imagen tipo photo-container ---
        if len(block) == 1 and isinstance(block[0], Tag) and block[0].name in ["ul", "ol"]:
            tag = block[0]
            is_ordered = tag.name == "ol"
            start = int(tag.get("start", 1)) if is_ordered else 1
            items = tag.find_all("li", recursive=False)
            i = 0
            while i < len(items):
                list_html = f'<ol start="{start + i}">' if is_ordered else "<ul>"
                list_lines = 0
                while i < len(items):
                    li = items[i]
                    has_span = li.find("span") is not None
                    has_p = li.find("p") is not None
                    li_lines = count_lines(li.get_text()) + 1
                    if has_span and has_p:
                        li_lines *= 2
                    li_html = str(li)
                    if current_lines + list_lines + li_lines > max_lines and list_lines > 0:
                        break
                    list_html += li_html
                    list_lines += li_lines
                    i += 1
                list_html += "</ol>" if is_ordered else "</ul>"
                if current_lines + list_lines > max_lines and current_page:
                    add_page()
                current_page += list_html
                current_lines += list_lines
                if i < len(items):
                    add_page()
        elif len(block) == 1 and isinstance(block[0], Tag) and block[0].name == "p":
            p = block[0]
            text = p.get_text()
            lines = count_lines(text) + 1
            if lines > max_lines:
                words = text.split()
                chunk = []
                for word in words:
                    chunk.append(word)
                    chunk_text = " ".join(chunk)
                    needed = count_lines(chunk_text)
                    if current_lines + needed + 1 > max_lines:
                        current_page += f"<p>{' '.join(chunk[:-1])}</p>"
                        add_page()
                        chunk = [word]
                        current_lines = 0
                    current_lines = count_lines(" ".join(chunk))
                if chunk:
                    current_page += f"<p>{' '.join(chunk)}</p>"
                    current_lines += 1
            else:
                if current_lines + lines > max_lines and current_page:
                    add_page()
                current_page += str(p)
                current_lines += lines
        elif len(block) == 1 and isinstance(block[0], Tag) and block[0].name == "li":
            li = block[0]
            has_span = li.find("span") is not None
            has_p = li.find("p") is not None
            li_lines = count_lines(li.get_text()) + 1
            if has_span and has_p:
                li_lines *= 2
            if current_lines + li_lines > max_lines and current_page:
                add_page()
            current_page += str(li)
            current_lines += li_lines
        elif len(block) == 2 and all(isinstance(e, Tag) for e in block) and block[0].name in [f"h{i}" for i in range(2, 7)]:
            total_lines = block_line_count(block)
            if current_lines + total_lines > max_lines and current_page:
                add_page()
            if block[1].name in ["ul", "ol"]:
                if current_lines + count_lines(block[0].get_text()) > max_lines and current_page:
                    add_page()
                current_page += str(block[0])
                current_lines += count_lines(block[0].get_text())
                tag = block[1]
                is_ordered = tag.name == "ol"
                start = int(tag.get("start", 1)) if is_ordered else 1
                items = tag.find_all("li", recursive=False)
                i = 0
                while i < len(items):
                    list_html = f'<ol start="{start + i}">' if is_ordered else "<ul>"
                    list_lines = 0
                    while i < len(items):
                        li = items[i]
                        has_span = li.find("span") is not None
                        has_p = li.find("p") is not None
                        li_lines = count_lines(li.get_text()) + 1
                        if has_span and has_p:
                            li_lines *= 2
                        li_html = str(li)
                        if current_lines + list_lines + li_lines > max_lines and list_lines > 0:
                            break
                        list_html += li_html
                        list_lines += li_lines
                        i += 1
                    list_html += "</ol>" if is_ordered else "</ul>"
                    if current_lines + list_lines > max_lines and current_page:
                        add_page()
                    current_page += list_html
                    current_lines += list_lines
                    if i < len(items):
                        add_page()
            else:
                if block[1].name == "p":
                    p = block[1]
                    text = p.get_text()
                    lines = count_lines(text) + 1
                    title_lines = count_lines(block[0].get_text())
                    if current_lines + title_lines + lines > max_lines and current_page:
                        add_page()
                    if current_lines + title_lines + lines > max_lines:
                        add_page()
                    current_page += str(block[0])
                    current_lines += title_lines
                    if lines > max_lines:
                        words = text.split()
                        chunk = []
                        for word in words:
                            chunk.append(word)
                            chunk_text = " ".join(chunk)
                            needed = count_lines(chunk_text)
                            if current_lines + needed + 1 > max_lines:
                                current_page += f"<p>{' '.join(chunk[:-1])}</p>"
                                add_page()
                                chunk = [word]
                                current_lines = 0
                            current_lines = count_lines(" ".join(chunk))
                        if chunk:
                            current_page += f"<p>{' '.join(chunk)}</p>"
                            current_lines += 1
                    else:
                        current_page += str(p)
                        current_lines += lines
                else:
                    total_lines = block_line_count(block)
                    if current_lines + total_lines > max_lines and current_page:
                        add_page()
                    current_page += block_to_html(block)
                    current_lines += total_lines
        else:
            total_lines = block_line_count(block)
            if current_lines + total_lines > max_lines and current_page:
                add_page()
            current_page += block_to_html(block)
            current_lines += total_lines

    if current_page.strip():
        blocks.append(current_page)
    return blocks


def paginate_html_tables(html: str, max_lines: int = 60) -> list:
    """
    Pagina tablas HTML, títulos (h2, h3, h4, etc.) y párrafos: parte la tabla por filas o títulos cuando no quepan más en la página.
    - Cada <tr> cuenta como 2 líneas + el máximo de líneas de celdas (según reglas).
    - Cada h2/h3/h4 cuenta como 2 líneas.
    - Los párrafos se parten según el número de caracteres por línea.
    """
    from bs4 import BeautifulSoup, Tag

    def count_lines(text, chars_per_line):
        lines = text.split('\n')
        total = 0
        for l in lines:
            total += max(1, (len(l.strip()) // chars_per_line) + (1 if len(l.strip()) % chars_per_line else 0))
        return total

    def split_paragraph(text, chars_per_line):
        """Divide un párrafo en líneas según el número de caracteres por línea."""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= chars_per_line:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines

    def row_line_count(row):
        cells = row.find_all(['td', 'th'], recursive=False)
        if not cells:
            return 2
        # Izquierda
        left = cells[0].get_text(separator=' ', strip=True)
        left_lines = count_lines(left, 18)
        # Derecha
        if len(cells) > 1:
            right_cell = cells[1]
            # Caso especial ODS secundarios: cuenta <br>
            if 'ODS secundarios' in left or 'ODS secundarios' in right_cell.get_text():
                br_count = len(right_cell.find_all('br'))
                right_lines = br_count + 1
            else:
                right = right_cell.get_text(separator=' ', strip=True)
                right_lines = count_lines(right, 58)
        else:
            right_lines = 0
        return 2 + max(left_lines, right_lines)

    def block_to_html(block):
        return ''.join(str(e) for e in block)

    def handle_paragraph(paragraph, current_lines, max_lines, chars_per_line=80):
        """Maneja la paginación de un párrafo."""
        text = paragraph.get_text()
        lines = split_paragraph(text, chars_per_line)
        remaining_lines = max_lines - current_lines
        if len(lines) <= remaining_lines:
            return str(paragraph), len(lines), []
        
        # Si no caben todas las líneas, dividir el párrafo
        current_page_lines = lines[:remaining_lines]
        next_page_lines = lines[remaining_lines:]
        
        # Crear dos párrafos
        current_page_p = Tag(name='p')
        current_page_p.string = ' '.join(current_page_lines)
        
        next_page_p = Tag(name='p')
        next_page_p.string = ' '.join(next_page_lines)
        
        return str(current_page_p), len(current_page_lines), [next_page_p]

    soup = BeautifulSoup(html, "html.parser")
    blocks = []
    current_page = ""
    current_lines = 0
    pending_elements = []

    elems = [e for e in soup.contents if not (isinstance(e, str) and e.strip() == "")]
    idx = 0
    temp_rows = []
    table_open = False

    while idx < len(elems) or pending_elements:
        # Si hay elementos pendientes, procesarlos primero
        if pending_elements:
            elem = pending_elements.pop(0)
        else:
            elem = elems[idx]
            idx += 1

        # Si es un título
        if elem.name in [f"h{i}" for i in range(2, 7)]:
            title_html = str(elem)
            title_lines = 2
            if current_lines + title_lines > max_lines and current_page:
                if table_open and temp_rows:
                    current_page += f'<table class="table">{block_to_html(temp_rows)}</table>'
                    temp_rows = []
                    table_open = False
                blocks.append(current_page)
                current_page = ""
                current_lines = 0
            current_page += title_html
            current_lines += title_lines
            continue

        # Si es un párrafo
        elif elem.name == "p":
            if current_lines >= max_lines and current_page:
                if table_open and temp_rows:
                    current_page += f'<table class="table">{block_to_html(temp_rows)}</table>'
                    temp_rows = []
                    table_open = False
                blocks.append(current_page)
                current_page = ""
                current_lines = 0

            p_html, p_lines, remaining_p = handle_paragraph(elem, current_lines, max_lines)
            current_page += p_html
            current_lines += p_lines
            pending_elements.extend(remaining_p)
            continue

        # Si es una tabla
        elif elem.name == "table":
            rows = elem.find_all("tr", recursive=False)
            i = 0
            table_open = True
            while i < len(rows):
                r = rows[i]
                row_lines = row_line_count(r)
                if current_lines + row_lines > max_lines and current_page:
                    if temp_rows:
                        current_page += f'<table class="table">{block_to_html(temp_rows)}</table>'
                        temp_rows = []
                    blocks.append(current_page)
                    current_page = ""
                    current_lines = 0
                temp_rows.append(r)
                current_lines += row_lines
                # Si la página se llena justo aquí, cierra la tabla y la página
                if current_lines >= max_lines:
                    current_page += f'<table class="table">{block_to_html(temp_rows)}</table>'
                    temp_rows = []
                    blocks.append(current_page)
                    current_page = ""
                    current_lines = 0
                i += 1
            if temp_rows:
                current_page += f'<table class="table">{block_to_html(temp_rows)}</table>'
                temp_rows = []
            table_open = False
            continue

        # Para cualquier otro elemento
        else:
            if isinstance(elem, Tag):
                elem_html = str(elem)
                elem_lines = count_lines(elem.get_text(), 80)
                if current_lines + elem_lines > max_lines and current_page:
                    if table_open and temp_rows:
                        current_page += f'<table class="table">{block_to_html(temp_rows)}</table>'
                        temp_rows = []
                        table_open = False
                    blocks.append(current_page)
                    current_page = ""
                    current_lines = 0
                current_page += elem_html
                current_lines += elem_lines
            continue

    if current_page.strip():
        blocks.append(current_page)
    return blocks

def paginate_material_topics(html: str, max_lines: int = 60, chars_per_line: int = 40) -> list:
    """
    Función específica para paginar el contenido de temas de materialidad.
    Maneja la estructura específica de dimensiones, títulos y listas de temas.
    """
    def count_lines(text):
        text = text.strip()
        if not text:
            return 0
        lines = text.split('\n')
        total = 0
        for line in lines:
            line = line.strip()
            if line:
                total += max(1, (len(line) // chars_per_line) + (1 if len(line) % chars_per_line else 0))
        return total

    soup = BeautifulSoup(html, "html.parser")
    blocks = []
    current_page = ""
    current_lines = 0

    def add_page():
        nonlocal current_page, current_lines
        if current_page.strip():
            blocks.append(current_page)
        current_page = ""
        current_lines = 0

    # Primero procesar los párrafos introductorios
    intro_paragraphs = soup.find_all("p", recursive=False)
    for p in intro_paragraphs:
        text = p.get_text()
        lines = count_lines(text) + 1  # +1 para el espacio entre párrafos
        if current_lines + lines > max_lines and current_page:
            add_page()
        current_page += str(p)
        current_lines += lines

    # Luego procesar cada dimensión
    dimensions = soup.find_all("h2", class_="dimension-title")
    for dimension in dimensions:
        # Contar líneas del título de la dimensión
        title_lines = count_lines(dimension.get_text()) + 2  # +2 para el espacio antes y después del título
        
        # Si no cabe el título en la página actual, crear una nueva
        if current_lines + title_lines > max_lines and current_page:
            add_page()
        
        # Agregar el título de la dimensión
        current_page += str(dimension)
        current_lines += title_lines

        # Procesar la lista de temas de esta dimensión
        topic_list = dimension.find_next("ul", class_="topic-list")
        if topic_list:
            items = topic_list.find_all("li", recursive=False)
            i = 0
            while i < len(items):
                list_html = "<ul class='topic-list'>"
                list_lines = 0
                
                while i < len(items):
                    li = items[i]
                    # Contar líneas del título y descripción
                    title = li.find("span", class_="topic-title")
                    desc = li.find("p", class_="topic-description")
                    
                    title_lines = count_lines(title.get_text()) if title else 0
                    desc_lines = count_lines(desc.get_text()) if desc else 0
                    
                    # Sumar líneas del elemento de lista
                    li_lines = title_lines + desc_lines + 2  # +2 para el espacio entre elementos
                    
                    if current_lines + list_lines + li_lines > max_lines and list_lines > 0:
                        break
                        
                    list_html += str(li)
                    list_lines += li_lines
                    i += 1
                
                list_html += "</ul>"
                
                # Si no cabe la lista en la página actual, crear una nueva
                if current_lines + list_lines > max_lines and current_page:
                    add_page()
                
                current_page += list_html
                current_lines += list_lines
                
                # Si quedan más elementos, crear una nueva página
                if i < len(items):
                    add_page()

    # Agregar la última página si hay contenido
    if current_page.strip():
        blocks.append(current_page)
        
    return blocks