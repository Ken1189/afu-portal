import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT =
  'You are an expert African agriculture AI assistant for the African Farming Union (AFU). ' +
  'You help farmers across 10 African countries (Botswana, Zimbabwe, Tanzania, Kenya, Nigeria, Zambia, Mozambique, South Africa, Ghana, Uganda) ' +
  'with crop health diagnosis, pest identification, farming advice, weather interpretation, market guidance, and financial literacy. ' +
  'Always give practical, actionable advice suitable for smallholder farmers. ' +
  'When analyzing crop images, identify the disease/pest/deficiency, explain the cause, and recommend treatment options including both organic and chemical solutions. ' +
  'Respond in clear, simple English.';

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, image, context } = body as {
      message?: string;
      image?: string;
      context?: string;
    };

    if (!message && !image) {
      return NextResponse.json(
        { error: 'Either message or image is required' },
        { status: 400 }
      );
    }

    // Build the parts array for Gemini
    const parts: Array<
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    > = [];

    // Add system prompt as the first text part
    const contextLabel = context ? ` (Context: ${context})` : '';
    parts.push({
      text: `${SYSTEM_PROMPT}${contextLabel}\n\nUser: ${message || 'Please analyze this image.'}`,
    });

    // Add image if provided
    if (image) {
      // Extract base64 data and mime type from data URL if present
      let base64Data = image;
      let mimeType = 'image/jpeg';

      if (image.startsWith('data:')) {
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    }

    const geminiBody = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 502 }
      );
    }

    const data = await geminiResponse.json();

    // Extract the text response from Gemini's response format
    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I was unable to generate a response. Please try again.';

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('AI chat route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
