"use client";

import styles from "./page.module.css";
import { Uploader } from "../components/Uploader/Uploader";
import { CsvRow } from "../components/Uploader/Uploader";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";

type RechartsClickEvent = {
  activePayload?: Array<{
    payload: Record<string, CsvRow>;
  }>;
};

export default function Home() {
  const [jsonData, setJsonData] = useState<{ fileName: string; data: CsvRow[] }[]>([]);
  const [pickedPoints, setPickedPoints] = useState<Record<string, any>[]>([]);
  const [zoomGraph, setZoomGraph] = useState({
    left: "dataMin",
    right: "dataMax",
    refAreaLeft: "",
    refAreaRight: "",
    top: "dataMax+1",
    bottom: "dataMin-1",
    animation: true,
  });

  const handleDataParsed = (fileData: { fileName: string; data: CsvRow[] }) => {
    setJsonData((prevData) => [...prevData, fileData]);
  };

  const getAxisYDomain = (from: number, to: number, dataKey: keyof CsvRow, offset: number) => {
    const refData = jsonData[0]?.data.slice(from, to + 1) || [];
    let [bottom, top] = [Infinity, -Infinity];
    refData.forEach((d) => {
      const value = Number(d[dataKey]);
      if (value > top) top = value;
      if (value < bottom) bottom = value;
    });
    return [bottom - offset, top + offset];
  };

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomGraph;

    if (!refAreaLeft || !refAreaRight || refAreaLeft === refAreaRight) {
      setZoomGraph((prev) => ({
        ...prev,
        refAreaLeft: "",
        refAreaRight: "",
      }));
      return;
    }

    if (refAreaLeft > refAreaRight) {
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    }

    const fromIndex = jsonData[0]?.data.findIndex((d) => d.Timestamp === Number(refAreaLeft));
    const toIndex = jsonData[0]?.data.findIndex((d) => d.Timestamp === Number(refAreaRight));

    if (fromIndex !== -1 && toIndex !== -1) {
      const [bottom, top] = getAxisYDomain(fromIndex, toIndex, "heading", 1);

      setZoomGraph((prev) => ({
        ...prev,
        refAreaLeft: "",
        refAreaRight: "",
        left: refAreaLeft,
        right: refAreaRight,
        bottom: bottom.toString(),
        top: top.toString(),
      }));
    }
  };

  const zoomOut = () => {
    setZoomGraph({
      left: "dataMin",
      right: "dataMax",
      refAreaLeft: "",
      refAreaRight: "",
      top: "dataMax+1",
      bottom: "dataMin-1",
      animation: true,
    });
  };

  const handleChartClick = (e: RechartsClickEvent) => {
    if (e?.activePayload && e.activePayload[0]?.payload) {
      const clickedPoint = e.activePayload[0].payload;
      setPickedPoints((prev) => [...prev, clickedPoint]);
    }
  };


  return (
    <div className={styles.page}>
      <Uploader onDataParsed={handleDataParsed} />

      <div style={{ userSelect: "none", width: "100%" }}>
        <button type="button" onClick={zoomOut}>
          Zoom Out
        </button>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={jsonData[0]?.data}
            onMouseDown={(e) => {
              if (e?.activeLabel) {
                setZoomGraph((prev) => ({ ...prev, refAreaLeft: e.activeLabel || "" }));
              }
            }}
            onMouseMove={(e) => {
              if (zoomGraph.refAreaLeft && e?.activeLabel) {
                setZoomGraph((prev) => ({ ...prev, refAreaRight: e.activeLabel || "" }));
              }
            }}
            onMouseUp={zoom}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="Timestamp"
              domain={[zoomGraph.left, zoomGraph.right]}
              allowDataOverflow
              type="number"
              tickFormatter={(unixTime) => {
                const date = new Date(unixTime);
                return date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              }}
            />
            <YAxis domain={[zoomGraph.bottom, zoomGraph.top]} allowDataOverflow />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="heading" stroke="#8884d8" />

            {zoomGraph.refAreaLeft && zoomGraph.refAreaRight && (
              <ReferenceArea
                x1={zoomGraph.refAreaLeft}
                x2={zoomGraph.refAreaRight}
                strokeOpacity={0.3}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

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
    </div>
  );
}
