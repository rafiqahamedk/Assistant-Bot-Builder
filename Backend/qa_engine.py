from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def ask_question(conn, question: str):
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM sentences")
    sentences = [row[0] for row in cursor.fetchall()]

    if not sentences:
        return "Knowledge base is empty.", 0.0

    vectorizer = TfidfVectorizer(
        stop_words="english",
        lowercase=True,
        ngram_range=(1, 2)
    )

    tfidf = vectorizer.fit_transform(sentences + [question])
    scores = cosine_similarity(tfidf[-1:], tfidf[:-1])

    best_index = scores.argmax()
    confidence = scores[0][best_index]

    if confidence < 0.05:
        return "Information not found.", confidence

    return sentences[best_index], confidence
