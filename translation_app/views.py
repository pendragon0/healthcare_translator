from django.http import JsonResponse
from django.shortcuts import render  # Import render for rendering HTML templates
import openai

# Set your OpenAI API key
openai.api_key = "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"

def index(request):
    # Render the index.html template
    return render(request, "index.html")

def translate_text(request):
    if request.method == "POST":
        # Get the text and target language from the request
        text = request.POST.get("text")
        target_language = request.POST.get("target_language", "Spanish")  # Default to Spanish

        if not text:
            return JsonResponse({"error": "No text provided"}, status=400)
        if not target_language:
            return JsonResponse({"error": "No target language provided"}, status=400)

        try:
            # Use OpenAI API to translate
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # Or "gpt-4" if available
                messages=[
                    {"role": "system", "content": f"You are a helpful assistant that translates text into {target_language}."},
                    {"role": "user", "content": f"Translate this while giving only the translated sentence: {text}"}
                ],
                max_tokens=100
            )

            # Extract the translated text
            translated_text = response['choices'][0]['message']['content'].strip()
            return JsonResponse({"translated_text": translated_text})

        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=500)
