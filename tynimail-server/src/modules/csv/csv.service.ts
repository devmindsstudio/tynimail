import { Injectable } from "@nestjs/common";
import { Readable } from 'stream';
import csv from 'csv-parser';

@Injectable()
export class CsvService {
    validateCSVHeaders(buffer: Buffer, requiredColumns = ["email"]): Promise<{ valid: boolean; message?: string; missingColumns?: string[] }> {
        return new Promise((resolve) => {
            if (!buffer || buffer.length === 0) {
                return resolve({ valid: false, message: 'CSV file is empty' });
            }

            let headerValidated = false;

            Readable.from(buffer)
                .pipe(csv())
                .on('data', (row) => {
                    if (!headerValidated) {
                        // Check headers from the first row
                        const headers = Object.keys(row);
                        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

                        if (missingColumns.length > 0) {
                            resolve({
                                valid: false,
                                message: `Missing required columns: ${missingColumns.join(', ')}`,
                                missingColumns
                            });
                        } else {
                            resolve({ valid: true });
                        }
                        headerValidated = true;
                    }
                })
                .on('error', (err) => {
                    resolve({ valid: false, message: `Error reading CSV: ${err.message}` });
                })
                .on('end', () => {
                    if (!headerValidated) {
                        resolve({ valid: false, message: 'CSV file has no data rows' });
                    }
                });
        });
    }

    parseCSV(buffer: Buffer): Promise<any[]> {
        const results: any[] = [];

        return new Promise((resolve, reject) => {
            Readable.from(buffer)
                .pipe(csv())
                .on('data', (row) => results.push(row))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }
}