import re
from typing import Dict
from g4f.client import Client

class LLMProcessor:
    """Processes email content using the g4f library."""
    
    def __init__(self):
        self.client = Client()
        self.model = "gpt-4"  # You can change this to any supported model


    def get_response(self, prompt = 'pretend you are a financial roboadvisor'):

        response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}]
            )
        
        # Extract the response content

        response_content = response.choices[0].message.content.strip()
        # Debug: Print the raw response for inspection
        print("Raw API Response:", response_content)
        
        return response_content

        


