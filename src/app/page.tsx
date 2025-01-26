"use client";

import styles from "./page.module.css";
import { Uploader } from "../components/Uploader/Uploader";
import { CsvRow } from "../components/Uploader/Uploader";
import { useState } from "react";
import { Linechart } from "../components/Linechart";

export default function Home() {
  const [jsonData, setJsonData] = useState<{ fileName: string; data: CsvRow[] }[]>([]);
  const [pickedPoints, setPickedPoints] = useState<Record<string, any>[]>([]);

  const handleDataParsed = (fileData: { fileName: string; data: CsvRow[] }) => {
    setJsonData((prevData) => [...prevData, fileData]);
  };

  const handlePointClick = (point: CsvRow) => {
    // Check if the point is already picked
    const isPointAlreadyPicked = pickedPoints.some(
      (pickedPoint) => JSON.stringify(pickedPoint) === JSON.stringify(point)
    );

    if (!isPointAlreadyPicked) {
      setPickedPoints((prev) => [...prev, point]);
    }
  };

  return (
    <div className={styles.page}>
      <Uploader onDataParsed={handleDataParsed} />

      {jsonData.length > 0 && (
        <>
          <Linechart data={jsonData[0].data} onPointClick={handlePointClick} />
          <div>
            <h2>Picked Points</h2>
            {pickedPoints.length > 0 ? (
              pickedPoints.map((point, index) => (
                <p key={index}>
                  <strong>Point {index + 1}:</strong>{" "}
                  {Object.entries(point).map(([key, value]) => (
                    <span key={key}>
                      {key}: {value},{" "}
                    </span>
                  ))}
                </p>
              ))
            ) : (
              <p>No points selected yet.</p>
            )}
          </div>
        </>
      )}

    </div>
  );
}
