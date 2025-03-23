import re
import numpy as np
from typing import Dict
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import faiss
from g4f.client import Client

class LLMProcessor:
    """Processes email content using the g4f library."""
    
    def __init__(self):
        self.client = Client()
        self.model = "gpt-4"  # You can change this to any supported model


    def get_response(self, prompt='pretend you are a financial roboadvisor'):

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract the response content
        response_content = response.choices[0].message.content.strip()
        
        # Debug: Print the raw response for inspection
        print("Raw API Response:", response_content)
        
        return response_content


class RAGSystem:
    """Retrieval-Augmented Generation system with NoSQL + FAISS + LLM."""
    
    def __init__(self):
        # MongoDB connection
        self.client = MongoClient("mongodb://localhost:27017")
        self.db = self.client["financial_rag"]

        # Embedding model
        self.embed_model = SentenceTransformer("all-MiniLM-L6-v2")

        # FAISS setup
        self.dimension = 384  # Dimension of MiniLM embeddings
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # LLM
        self.llm = LLMProcessor()

    def fetch_data(self):
        """Fetch data from NoSQL collections and combine it."""
        messages = [doc['content'] for doc in self.db.messages.find()]
        emails = [doc['body'] for doc in self.db.emails.find()]
        personal_data = [f"User {doc['user_id']} is {doc['age']} years old with {doc['risk_profile']} risk profile"
                         for doc in self.db.personal_data.find()]

        # Combine all data
        data = messages + emails + personal_data
        return data

    def build_index(self):
        """Builds FAISS index with NoSQL data embeddings."""
        data = self.fetch_data()

        # Generate embeddings
        vectors = self.embed_model.encode(data)

        # Add to FAISS index
        self.index.add(np.array(vectors).astype('float32'))

        print("✅ FAISS index built with NoSQL data!")

        # Store data references
        self.data = data

    def retrieve(self, query, top_k=3):
        """Retrieve the top-k most relevant data chunks."""
        query_vector = self.embed_model.encode([query])

        # FAISS similarity search
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), top_k)

        results = [self.data[i] for i in indices[0]]
        return results

    def run_rag(self, query):
        """Full RAG pipeline: retrieve, augment, and generate."""
        
        # Retrieve relevant context
        context = self.retrieve(query, top_k=3)

        # Prepare the prompt with the context
        prompt = f"""
        You are a financial advisor. Use the following context to provide a response:
        
        Context:
        {context}

        Query: {query}
        """
        
        # LLM generation
        response = self.llm.get_response(prompt)
        return response
