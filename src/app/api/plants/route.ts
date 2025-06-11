import { NextResponse } from "next/server"; //devuelve el post
import { callOpenAI, validateRequest, cleanOpenAIResponse, saveToDataBase } from "@/lib/plantsHooks";
import { PlantResponse } from "@/interfaces/plants";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Instanciar el cliente
const client = await clientPromise; 

export async function POST(req: Request) {

    const validationResponse = await validateRequest();
    if (validationResponse) {
        return validationResponse;
    }

    const body: PlantResponse = await req.json();
    const { image } = body;
    if (!image) {
        return NextResponse.json(
            { error: "Image is required" },
            { status: 400 }
        );
    }

    const response = await callOpenAI(image);
    if (!response) {
        throw new Error("No response from OpenAI");
    }

    let plant : PlantResponse;

    try{
        const cleanedResponse = cleanOpenAIResponse(response);
        // console.log("Cleaned OpenAI Response:", cleanedResponse);
        plant = JSON.parse(cleanedResponse);
    } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        throw error;
    }

    const result = await saveToDataBase(plant, image);
    return result;
}


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        const db = client.db();
        const plantsColecction = db.collection("plants");
        
        if (!id) {
            const plants = await plantsColecction.find().toArray();
            return NextResponse.json(plants, { status: 200 });
        }

        const plant = await plantsColecction.findOne({ _id: new ObjectId(id) });
        if( !plant ) {
            return NextResponse.json({ error: "Plant not found" },{ status: 404 });
        }

        return NextResponse.json(plant, { status: 200 });

    } catch (error) {
        console.error("Error in GET /plants:", error);
        return NextResponse.json({ error: "Failed to recognize plant" },{ status: 500 });
    }
}

export async function DELETE(request: Request) {

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const db = client.db();
    const plantsColecction = db.collection("plants");

    if (!id) {
        return NextResponse.json({ error: "Plant ID is required" }, { status: 400 });
    }

    try {
        await plantsColecction.deleteOne({ _id: new ObjectId(id) });
        return NextResponse.json({ message: "Plant deleted successfully" }, { status: 200 });
        
    }catch (error) {
        console.error("Error in DELETE /plants:", error);
        return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 });
    }
}