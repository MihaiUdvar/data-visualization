"use client";

import {
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   ReferenceArea,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from "recharts";
import { useState } from "react";
import { CsvRow } from "./Uploader/Uploader";

type ZoomGraphState = {
   left: string | number;
   right: string | number;
   refAreaLeft: string | number;
   refAreaRight: string | number;
   top: string | number;
   bottom: string | number;
   animation: boolean;
};
type LinechartProps = {
   data: CsvRow[];
   onPointClick: (point: CsvRow) => void;
};

export const Linechart = ({ data, onPointClick }: LinechartProps) => {
   const [zoomGraph, setZoomGraph] = useState<ZoomGraphState>({
      left: "dataMin",
      right: "dataMax",
      refAreaLeft: "",
      refAreaRight: "",
      top: "dataMax+1",
      bottom: "dataMin-1",
      animation: true,
   });

   const getAxisYDomain = (from: number, to: number, dataKey: keyof CsvRow, offset: number) => {
      const refData = data.slice(from, to + 1);
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

      const fromIndex = data.findIndex((d) => d.Timestamp === Number(refAreaLeft));
      const toIndex = data.findIndex((d) => d.Timestamp === Number(refAreaRight));

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

   const handleChartClick = (e: any) => {
      if (e?.activePayload && e.activePayload[0]?.payload) {
         onPointClick(e.activePayload[0].payload);
      }
   };

   return (
      <div style={{ userSelect: "none", width: "100%" }}>
         <button type="button" onClick={zoomOut}>
            Zoom Out
         </button>

         <ResponsiveContainer width="100%" height={400}>
            <LineChart
               data={data}
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
   );
};
