# Interview Assistant

> An AI-powered full-stack application for conducting technical interviews, evaluating candidate answers, and helping candidates prepare — powered by **GigaChat API** and a **local embeddings model**.

---

## Features

- **Question Generation** — Automatically generates relevant interview questions based on the job role or topic.
- **Answer Evaluation** — Analyzes and scores candidate answers using AI, providing structured feedback.
- **Interview Preparation** — Helps candidates practice by simulating interview scenarios and tracking progress.
- **Semantic Search** — Uses a local embeddings model to find contextually relevant questions and answers.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python (FastAPI)            |
| Frontend  | TypeScript, React, SCSS             |
| AI Engine | GigaChat API (Sber)                 |
| Embeddings | Local embeddings model             |

---

## Project Structure

```
interview_assistant/
├── backend/                  # Python backend
│   ├── main.py               # Entry point
│   ├── routers/              # API route handlers
│   ├── services/             # Business logic & AI integration
│   ├── models/               # Data models / schemas
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   └── interview-assistant/  # React + TypeScript frontend
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── pages/        # Application pages
│       │   └── services/     # API client
│       ├── package.json
│       └── tsconfig.json
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- GigaChat API credentials ([get them here](https://developers.sber.ru/portal/products/gigachat))

---

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GIGACHAT_API_KEY and other settings

# Start the server
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`.

---

### Frontend Setup

```bash
cd frontend/interview-assistant

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GIGACHAT_API_KEY=your_gigachat_api_key
GIGACHAT_SCOPE=GIGACHAT_API_PERS      # or GIGACHAT_API_CORP
EMBEDDINGS_MODEL_PATH=./models/embeddings   # path to local embeddings model
```

---

## 🔌 API Overview

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/questions/generate` | Generate interview questions        |
| POST   | `/api/answers/evaluate`   | Evaluate a candidate's answer       |
| GET    | `/api/questions`          | List available questions            |
| POST   | `/api/sessions`           | Start a new interview session       |

> Full API documentation available at `http://localhost:8000/docs` (Swagger UI).

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [GigaChat](https://developers.sber.ru/portal/products/gigachat) — LLM by Sberbank
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — Frontend stack
