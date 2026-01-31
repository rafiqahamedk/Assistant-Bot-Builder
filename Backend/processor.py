import re
import fitz

def clean_and_split(text: str):
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'([.!])([A-Z])', r'\1 \2', text)

    splits = re.split(r'\.\s+|\!\s+|\||\n', text)
    return [s.strip() for s in splits if len(s.strip()) > 3]

def process_text(conn, raw_text: str):
    sentences = clean_and_split(raw_text)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM sentences")
    cursor.executemany(
        "INSERT INTO sentences (source, content) VALUES (?, ?)",
        [("text", s) for s in sentences]
    )
    conn.commit()

    return len(sentences)

def extract_pdf_text(pdf_path: str):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text("text") + " "
    return text

def process_pdf(conn, pdf_path: str):
    raw_text = extract_pdf_text(pdf_path)
    sentences = clean_and_split(raw_text)

    cursor = conn.cursor()
    cursor.execute("DELETE FROM sentences")
    cursor.executemany(
        "INSERT INTO sentences (source, content) VALUES (?, ?)",
        [("pdf", s) for s in sentences]
    )
    conn.commit()

    return len(sentences)
