'use client'

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import css from './Uploader.module.css';

// CSV Row Interface
export interface CsvRow {
   Timestamp: number | null;
   H2: number | null;
   He: number | null;
   lat: number | null;
   lon: number | null;
   heading: number | null;
   speed: number | null;
}

// Props for Uploader
interface UploaderProps {
   onDataParsed: (fileData: { fileName: string; data: CsvRow[] }) => void;
}

export const Uploader = ({ onDataParsed }: UploaderProps) => {
   const onDrop = useCallback((acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
         const reader = new FileReader();
         reader.onload = (e) => {
            const text = e.target?.result as string;
            const jsonData = csvToJson(text);

            // Send parsed data to the parent component
            onDataParsed({ fileName: file.name, data: jsonData });
         };
         reader.readAsText(file);
      });
   }, [onDataParsed]);

   const csvToJson = (csv: string): CsvRow[] => {
      const [headerLine, ...lines] = csv.trim().split('\n');
      const headers = headerLine.split(',').map((header) => header.trim());

      return lines.map((line) => {
         const values = line.split(',').map((value) => (value.trim() === '' ? null : value.trim()));

         return headers.reduce((acc, header, idx) => {
            // Convert the appropriate fields to numbers, else keep them as strings or null
            const value = values[idx] ?? null;

            if (header === 'Timestamp' && value !== null) {
               // Parse the timestamp to Unix timestamp (milliseconds)
               acc[header as keyof CsvRow] = Date.parse(value);
            } else {
               acc[header as keyof CsvRow] = value !== null ? parseFloat(value) : null;
            }


            return acc;
         }, {} as CsvRow);
      });
   };



   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

   return (
      <div {...getRootProps()} className={css.dropzone}>
         <input {...getInputProps()} />
         {isDragActive ? (
            <p>Drop the files here ...</p>
         ) : (
            <p>Drag and drop some .csv files here, or click to select files</p>
         )}
      </div>
   );
};
