# 🤖 Assistant Bot Builder

An AI Assistant Bot Builder platform for creating, training, and managing secure, local knowledge-based chatbots using a FastAPI backend and React frontend. The system uses a local RAG (Retrieval-Augmented Generation) pipeline with TF-IDF + cosine similarity — no external AI API keys required.Designed for private, offline-first deployments and modular assistant creation workflows.

---


# 📌 Overview

Assistant Bot Builder enables developers and organizations to create domain-specific AI assistants trained on their own documents and text sources. It provides a secure management interface, local retrieval engine, and embeddable chatbot widget for websites.

Key goals:

- Local AI assistant creation
- No cloud dependency required
- Secure bot management
- Fast document-based retrieval
- Simple website embedding
- Modular and extensible architecture

---

## ✨ Features

### 🎯 Core Functionality
* **Local RAG Engine**: Performs information retrieval using TF-IDF vectorization and cosine similarity without requiring external API keys.
* **Multi-Format Training**: Support for training bots via raw text input or PDF document uploads.
* **Encrypted Access**: Multi-layer security featuring **bcryptjs** for user accounts and bot-specific management gates.
* **Unified Management**: A single-view hub to monitor bot metadata, update knowledge bases, and retrieve embed scripts.

### 🚀 Advanced Features
* **Live Script Generation**: Real-time generation of embeddable `<script>` tags for third-party website integration.
* **Dynamic Knowledge Sync**: Instant database updates when new documentation is provided via the manager hub.
* **Automated Text Cleaning**: Sophisticated regex-based cleaning and sentence splitting to ensure high-quality training data.
* **Persistent Local Storage**: Efficient metadata management using browser LocalStorage for user sessions and bot configurations.

### 🎨 User Experience
* **Cyberpunk Aesthetic**: High-contrast "Slate & Cyan" dark theme designed for modern technical environments.
* **Visual Stepper**: An intuitive two-step wizard for initializing security and knowledge parameters.
* **Responsive Dashboard**: Adaptive grid layout for managing multiple AI assistants across all device sizes.

---

## 🛠️ Tech Stack

### Frontend
* **React 18**: Component-based UI architecture.
* **Tailwind CSS**: Utility-first styling for high-performance renders.
* **Lucide React**: Premium icon set for consistent visual language.
* **Bcryptjs**: Client-side hashing for "Zero-Knowledge" security.

### Backend
* **FastAPI (Python)**: High-performance asynchronous API framework.
* **SQLite**: Lightweight, file-based database for sentence and metadata storage.
* **Scikit-learn**: Powering the mathematical retrieval and similarity engine.
* **PyMuPDF**: High-fidelity text extraction from PDF sources.

---

## 🚀 Quick Start

### Prerequisites
* **Python 3.10+** and **Node.js 18+**.
* Hardware: Lenovo Ideapad 330 or equivalent (8GB RAM / SSD recommended).

### Installation & Execution
1.  **Clone and Install Backend**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
2.  **Install Frontend**
    ```bash
    cd frontend
    npm install
    npm start
    ```

---

## 📁 Project Structure

```text
ai-bot-creator/
├── backend/                # FastAPI (Python) Server
│   ├── uploads/            # Storage for processed PDFs
│   ├── database.py         # SQLite setup & schema
│   ├── main.py             # API routes & Widget.js provider
│   ├── processor.py        # PDF/Text cleaning logic
│   ├── qa_engine.py        # TF-IDF & Cosine Similarity brain
│   └── requirements.txt    # Python dependencies
├── frontend/               # React (Vite/Next.js) Application
│   ├── public/             # Static assets (icons, manifest)
│   ├── src/
│   │   ├── components/     # UI building blocks
│   │   ├── pages/          # Auth, Dashboard, BotManager
│   │   ├── utils/          # api.js, storage.js
│   │   ├── App.jsx         # Routing & Layout
│   │   └── main.jsx        # App entry point
│   ├── index.css           # Tailwind & Global styles
│   └── package.json        # Node dependencies & scripts
├── knowledge_base.db       # Persistent SQLite database
├── .gitignore              # Files to exclude from GitHub
└── README.md               # Project documentation

```

---

# 📦 Deployment Options

Supported:
- Local machine deployment
- On-premise server installation
- Intranet-only network hosting
- Offline laboratory environments
- Private enterprise infrastructure nodes

---

# 🧩 Extension Ideas

Possible future enhancements:
- Replace TF-IDF with embedding-based retrieval
- Integrate vector database (FAISS / Chroma / Milvus)
- Add multi-language training and querying
- Enable streaming response delivery
- Implement role-based bot access control
- Add pluggable model provider layer
- Support multi-agent workflows

---

# 👨‍💻 Use Cases

Applicable scenarios:
- Internal company FAQ assistants
- Private document knowledge bots
- Academic research assistants
- Offline technical support agents
- Domain-specific Q&A systems

---

## 🔍 API Endpoints
* POST /train/text: Ingests raw string content into the local database.

* POST /train/pdf: Extracts text from PDF files to update the RAG index.

* POST /ask: Queries the knowledge base and returns the best-fit answer with a confidence score.

---

## 🔒 Security Protocol
* No Plain-Text Storage: All user and bot passwords are encrypted using bcryptjs before storage.

* Verification Gates: Modifying or deleting a bot requires a secondary bcrypt verification check.

* Local First: All data remains on the host machine to ensure maximum privacy for the SCAP network.

---

# 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ for the AI community.

---
