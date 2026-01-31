from fastapi import FastAPI, UploadFile, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

from database import get_db
from processor import process_text, process_pdf
from qa_engine import ask_question

app = FastAPI(title="Assistant Bot Creator Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/widget.js")
def get_widget():
    js_content = """
    (function() {
        const API_BASE = "http://127.0.0.1:8000";
        const PRIMARY = "#8B5CF6";
        const GREETING = "Hello! I am SCAP AI, here to serve you. How can I help you today?";

        const style = document.createElement("style");
        style.innerHTML = `
            .cg-wrap { position:fixed; bottom:20px; right:20px; z-index:9999; font-family: sans-serif; }
            .cg-btn { width:56px; height:56px; border-radius:18px; background:${PRIMARY}; color:white; border:none; cursor:pointer; font-weight:900; box-shadow:0 0 20px ${PRIMARY}66; transition: transform 0.2s; }
            .cg-btn:hover { transform: scale(1.1); }
            .cg-panel { width:350px; height:480px; background:#1e293b; border-radius:22px; margin-bottom:15px; display:none; flex-direction:column; overflow:hidden; border:1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .cg-head { padding:15px; background:${PRIMARY}; color:white; font-weight:bold; font-size: 16px; }
            .cg-body { flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; color:white; font-size:14px; scroll-behavior: smooth; }
            .cg-msg { padding:10px 14px; border-radius:15px; max-width:85%; line-height:1.4; word-wrap: break-word; }
            .cg-user { background:${PRIMARY}; align-self:flex-end; border-bottom-right-radius: 2px; }
            .cg-bot { background:#334155; align-self:flex-start; border-bottom-left-radius: 2px; border: 1px solid #475569; }
            .cg-foot { padding:12px; border-top:1px solid #334155; display:flex; gap:8px; background: #1e293b; }
            .cg-in { flex:1; background:#0f172a; border:1px solid #334155; border-radius:10px; padding:10px; color:white; outline:none; }
            .cg-send { background:${PRIMARY}; border:none; color:white; padding:10px 15px; border-radius:10px; cursor:pointer; font-weight: bold; }
        `;
        document.head.appendChild(style);

        const wrap = document.createElement("div");
        wrap.className = "cg-wrap";
        wrap.innerHTML = `
            <div class="cg-panel" id="cg-panel">
                <div class="cg-head">SCAP AI Assistant</div>
                <div class="cg-body" id="cg-body"></div>
                <div class="cg-foot">
                    <input class="cg-in" id="cg-in" placeholder="Ask about textiles..." />
                    <button class="cg-send" id="cg-send">Send</button>
                </div>
            </div>
            <button class="cg-btn" id="cg-btn">AI</button>
        `;
        document.body.appendChild(wrap);

        const panel = document.getElementById("cg-panel");
        const body = document.getElementById("cg-body");
        const input = document.getElementById("cg-in");

        document.getElementById("cg-btn").onclick = () => {
            panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "flex" : "none";
        };

        function addMsg(text, who) {
            const d = document.createElement("div");
            d.className = "cg-msg cg-" + who;
            d.textContent = text;
            body.appendChild(d);
            body.scrollTop = body.scrollHeight;
        }

        setTimeout(() => {
            addMsg(GREETING, "bot");
        }, 500);

        async function ask() {
            const q = input.value.trim();
            if(!q) return;
            
            addMsg(q, "user");
            input.value = "";

            const fd = new FormData();
            fd.append("question", q);

            try {
                const res = await fetch(API_BASE + "/ask", { method:"POST", body:fd });
                const data = await res.json();
                addMsg(data.answer || "I couldn't find information on that.", "bot");
            } catch(e) {
                addMsg("Connection error. Is the server running?", "bot");
                console.error(e);
            }
        }

        document.getElementById("cg-send").onclick = ask;
        input.onkeydown = (e) => { if(e.key === "Enter") ask(); };
    })();
    """
    return Response(content=js_content, media_type="application/javascript")

@app.post("/train/text")
def train_text(content: str = Form(...)):
    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    try:
        conn = get_db()
        count = process_text(conn, content)
        conn.close()
        return {"status": "success", "stored_sentences": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train/pdf")
async def train_pdf(file: UploadFile):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        conn = get_db()
        count = process_pdf(conn, file_path)
        conn.close()
        return {"status": "success", "stored_sentences": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
def ask(question: str = Form(...)):
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        conn = get_db()
        answer, confidence = ask_question(conn, question)
        conn.close()
        return {"answer": answer, "confidence": round(confidence, 3)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))