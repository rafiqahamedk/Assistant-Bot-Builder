import sqlite3
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def setup_database():
    conn = sqlite3.connect('knowledge_base.db')
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS sentences')
    cursor.execute('CREATE TABLE sentences (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL)')
    conn.commit()
    return conn

def save_to_db(conn, sentences):
    cursor = conn.cursor()
    cursor.executemany('INSERT INTO sentences (content) VALUES (?)', [(s,) for s in sentences])
    conn.commit()

def find_answer_in_db(conn, question):
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
        return "Information not found.", best_score
        
    return sentences[best_match_idx], best_score

db_conn = setup_database()

print("--- Step 1: Input Knowledge ---")
print("Enter/Paste your text. Press Enter twice to finish:")

user_lines = []
while True:
    line = input()
    if line == "": break
    user_lines.append(line)

raw_text = " ".join(user_lines)

sanitized_text = re.sub(r'([\.!])([A-Z])', r'\1 \2', raw_text)

split_pattern = r'\.\s+|\!\s+|\n'
clean_sentences = re.split(split_pattern, sanitized_text)

final_sentences = [s.strip() for s in clean_sentences if len(s.strip()) > 3]

save_to_db(db_conn, final_sentences)
print(f"\nSUCCESS: Stored {len(final_sentences)} clean rows in SQLite.")

print("\n--- Step 2: Ask Questions ---")
while True:
    query = input("\nYour Question: ")
    if query.lower() in ['exit', 'quit']:
        break
    
    answer, confidence = find_answer_in_db(db_conn, query)
    print(f"Confidence: {confidence:.2f}")
    print(f"ANSWER: {answer}")

db_conn.close()