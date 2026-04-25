import asyncio
from services.report_analyzer import analyze_medical_report

async def main():
    try:
        # Create a dummy pdf using fpdf or something else, but since we don't have it, we can just pass an empty byte string and "application/pdf"
        # Wait, if we pass empty string, it will hit pdfplumber, fail (or return no text), and fallback to sending empty byte string to Gemini.
        # Gemini will probably complain. Let's see.
        pdf_bytes = b"Dummy bytes"
        result = await analyze_medical_report(pdf_bytes, 'application/pdf', 'blood_report')
        print("Final Result:", result)
    except Exception as e:
        print('Error:', e)

asyncio.run(main())
