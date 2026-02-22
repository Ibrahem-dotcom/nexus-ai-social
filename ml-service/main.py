import os
import numpy as np
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client
from sentence_transformers import SentenceTransformer

# ===============================
# System Configuration
# ===============================

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Nexus ML Recommendation Engine")

# ===============================
# Environment Variables
# ===============================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing Supabase Environment Variables")

# ===============================
# Clients Initialization
# ===============================

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Embedding Model
model = SentenceTransformer("all-MiniLM-L6-v2")

# ===============================
# Request Schema
# ===============================

class PostData(BaseModel):
    post_id: str
    caption: str

# ===============================
# Helper Functions
# ===============================

def normalize_vector(vec):
    arr = np.array(vec)
    norm = np.linalg.norm(arr)

    if norm == 0:
        return vec

    return (arr / norm).tolist()

# ===============================
# API Endpoint
# ===============================

@app.post("/generate-embedding")
async def generate_embedding(data: PostData):

    try:

        logging.info(f"Embedding generation request for post {data.post_id}")

        # Generate embedding
        embedding = model.encode(data.caption)

        embedding = normalize_vector(embedding)

        # Update database
        response = supabase.table("posts").update({
            "embedding": embedding
        }).eq("id", data.post_id).execute()

        return {
            "status": "success",
            "post_id": data.post_id
        }

    except Exception as e:

        logging.error(str(e))

        raise HTTPException(
            status_code=500,
            detail="ML Processing Error"
)
