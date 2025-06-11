"use client";

import { useState } from "react";
import PlantUpload from "./components/PlantUpload";
import PlantList from "./components/PlantList";
import PlantModal from "./components/PlantModal";
import { PlantResponse } from "@/interfaces/plants";

export default function Home() {
  const [selectedPlant, setSelectedPlant] = useState<(PlantResponse & { _id: string }) | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePlantClick = (plant: PlantResponse & { _id: string }) => {
    setSelectedPlant(plant);
  };

  const handlePlantAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePlantDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-md shadow-md p-2 mb-8">
          <h1 className="text-3xl text-emerald-800 font-bold text-center">
            Plant Garden
          </h1>
        </div>

        <div className="mb-8">
          <PlantUpload onPlantAdded={handlePlantAdded} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-black">My Plants</h2>
          <PlantList onPlantClick={handlePlantClick} key={refreshTrigger} />
        </div>

        {selectedPlant && (
          <PlantModal
            plant={selectedPlant}
            onClose={() => setSelectedPlant(null)}
            onDelete={handlePlantDeleted}
          />
        )}
      </div>
    </div>
  );
}