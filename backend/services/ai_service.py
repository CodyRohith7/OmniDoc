import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if API_KEY:
    client = genai.Client(api_key=API_KEY)

import asyncio

async def analyze_text(text: str) -> dict:
    if not client:
        raise Exception("GEMINI_API_KEY environment variable is not set in backend/.env")

    # Trying gemini-flash-latest which often has more stable quota aliases
    model_id = 'gemini-flash-latest'
    
    prompt = f"""
    Act as a professional, high-fidelity document analysis expert. Analyze the following document text and perform these tasks with maximum precision:
    
    1. PROVIDE A COMPREHENSIVE SUMMARY: Write a multi-paragraph, in-depth summary of at least 250-300 words. Detail the purpose, all major participants, key terms, dates, and conclusions. Do NOT be concise; provide every important detail.
    2. ENTITY EXTRACTION: Identify every single named entity and categorize them meticulously into: 'names' (people), 'organizations', 'dates', and 'amounts' (specific monetary values). 
    3. SENTIMENT ANALYSIS: Determine the overall emotional tone (Positive, Negative, or Neutral).
    4. CATEGORIZATION: Precisely classify the document type (e.g., 'Invoice', 'Resume', 'Legal Contract', 'Medical Report', etc.).
    
    RESPOND ONLY IN VALID JSON FORMAT MATCHING THIS EXACT SCHEMA:
    {{
      "summary": "Full detailed multi-paragraph summary text here...",
      "category": "Document Type Here",
      "entities": {{
        "names": ["Name 1", "Name 2"],
        "organizations": ["Organization 1"],
        "dates": ["Date 1"],
        "amounts": ["Value 1"]
      }},
      "sentiment": "Positive|Negative|Neutral"
    }}
    
    DOCUMENT TEXT FOR ANALYSIS:
    {text}
    """
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                }
            )
            
            if hasattr(response, 'text') and response.text:
                raw_text = response.text
            elif hasattr(response, 'candidates') and len(response.candidates) > 0:
                raw_text = response.candidates[0].content.parts[0].text
            else:
                raise Exception("Gemini returned an empty response.")
                
            # Clean up potential markdown formatting that Gemini might output
            cleaned_text = raw_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            try:
                return json.loads(cleaned_text)
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON. Raw response: {raw_text}")
                # Sometimes the response might have extra data, try to find the complete JSON object
                import re
                match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                if match:
                    try:
                        return json.loads(match.group(0))
                    except:
                        pass
                raise Exception(f"Failed to parse response as JSON: {e}")

        except Exception as e:
            # If rate limited (429), wait and retry
            if "429" in str(e) and attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2
                print(f"Rate limited. Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
            
            print(f"Error from AI Service: {e}")
            raise Exception(f"AI Service Failure: {e}")
