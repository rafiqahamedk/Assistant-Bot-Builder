import fitz  
import sqlite3
import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def setup_database():
    conn = sqlite3.connect('pdf_knowledge.db')
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS sentences')
    cursor.execute('CREATE TABLE sentences (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL)')
    conn.commit()
    return conn

def save_to_db(conn, sentences):
    cursor = conn.cursor()
    cursor.executemany('INSERT INTO sentences (content) VALUES (?)', [(s,) for s in sentences])
    conn.commit()

def extract_text_from_pdf(pdf_path):
    pdf_path = pdf_path.replace('"', '').replace("'", "").strip()
    if not os.path.exists(pdf_path):
        print(f"Error: Could not find file at: {pdf_path}")
        return ""
    
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text("text") + " "
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def find_answer(conn, question):
    cursor = conn.cursor()
    cursor.execute('SELECT content FROM sentences')
    sentences = [row[0] for row in cursor.fetchall()]
    
    if not sentences:
        return "Database is empty.", 0
        
    vectorizer = TfidfVectorizer(stop_words='english', lowercase=True, ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(sentences + [question])
    
    scores = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
    best_match_idx = scores.argmax()
    best_score = scores[0][best_match_idx]
    
    if best_score < 0.05:
        return "I couldn't find that in the database.", best_score
        
    return sentences[best_match_idx], best_score

db_conn = setup_database()

print("--- PDF Data Extractor ---")
path_input = input("Paste the path to your PDF: ")

raw_text = extract_text_from_pdf(path_input)

if raw_text:
    
    sanitized_text = re.sub(r'\s+', ' ', raw_text)
    
    sanitized_text = re.sub(r'([\.!])([A-Z])', r'\1 \2', sanitized_text)
    
    split_pattern = r'\.\s+|\!\s+|\||\n'
    

    raw_splits = re.split(split_pattern, sanitized_text)
    
    clean_sentences = [s.strip() for s in raw_splits if len(s.strip()) > 2]

    save_to_db(db_conn, clean_sentences)
    print(f"SUCCESS: {len(clean_sentences)} data points stored.")

    print("\n--- Ask Questions (Type 'exit' to quit) ---")
    while True:
        query = input("\nYour Question: ")
        if query.lower() in ['exit', 'quit']:
            break
        
        answer, confidence = find_answer(db_conn, query)
        print(f"Confidence: {confidence:.2f}")
        print(f"ANSWER: {answer}")
else:
    print("Failed to process PDF.")

db_conn.close()