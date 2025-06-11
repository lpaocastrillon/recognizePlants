import { PlantResponse } from "@/interfaces/plants";
import { NextResponse } from "next/server"; //devuelve el post
import OpenAI from "openai";
import clientPromise from "@/lib/mongodb";

// Instanciar Api OpenAI
const openai = new OpenAI({  
    apiKey: process.env.OPENAI_API_KEY,
});

// Instanciar el cliente
const client = await clientPromise; 

export function cleanOpenAIResponse(response: string){
    // Elimina bloques de código y espacios
    let cleaned = response.replace(/```json\n?/g, "").replace(/```/g, "").trim();

    // Extrae el primer objeto JSON válido del string
    const match = cleaned.match(/{[\s\S]*}/);
    if (match) {
        return match[0];
    }
    // Si no encuentra un objeto JSON, retorna el string limpio (puede causar error en el parseo)
    return cleaned;
}

export async function validateRequest() {
    if (!process.env.OPENAI_API_KEY) {
           return NextResponse.json(
                { error: "OPENAI_API_KEY environment variable is not set" },
                { status: 500 } 
            );
    }
    
    if (!process.env.MONGODB_URI) {
        return NextResponse.json(
            { error: "MONGODB_URI environment variable is not set" },
            { status: 500 }
        );
    }
}

export async function callOpenAI(image: string){
    const prompt = `Analiza esta imagen de una planta y proporciona una respuesta detallada en formato JSON con la siguiente estructura: 
    {
        "name": "Nombre comun de la planta",
        "description": "Breve descripción de las caracteristicas y apariencias de la planta",
        "difficulty": "easy,/medium/hard - Basado en el cuidado de la planta y que tan desafiante es mantenerla",
        "water": ["lunes", "miércoles", "viernes"], Array de dias de la semana en españo para el riego recomentado de la planta,
        "temperature": numero, Temperatura recomendada en grados Celsius,
        "humidity": numero, Humedad recomendada en porcentaje, 
        "light": "low/medium/high", Nivel de luz recomendado para la planta,
    }
        
    Por favor asegurate de que todos los valores conincida exactamente con el formato JSON y que todos los campos esten presentes, la respuesta debe ser 
    JSON valido.
    Devuelve solo JSON valido, sin comentarios o explicaciones adicionales ni texto adicional.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: image // URL de la imagen de la planta    
                        }
                    }
                ]
            }
        ],
        temperature: 0.0, // Controla la creatividad de la respuesta
    });

    return completion.choices[0].message.content;
}

export async function saveToDataBase(plant: PlantResponse, image: string){
    const db = client.db();    
    try {
        const result = {
            ...plant,
            image: image,
            createdAt: new Date(),
        }

        const plantCollection = db.collection("plants");
        await plantCollection.insertOne(result);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error saving to database:", error);
        throw error;
    }
}