/* eslint-disable prettier/prettier */
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { error } from '@/responses';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const CsvUploadInterceptor = (
    fieldName = 'file',
    maxSizeMB = 5,
    allowedTypes: string[] = ['text/csv', 'application/vnd.ms-excel'],
) =>
    FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(
                    new BadRequestException(error('Only CSV files are allowed', 'INVALID-FILE-TYPE')),
                    false,
                );
            }
            cb(null, true);
        },
    });

const multerOptionsImages = (
    maxSizeMB = 2,
    allowedTypes: string[] = ['image/jpeg', 'image/png'],
    maxCount = 1,
): MulterOptions => ({
    storage: memoryStorage(),
    limits: { fileSize: maxSizeMB * 1024 * 1024, files: maxCount },
    fileFilter: (_req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new BadRequestException(error('Only images are allowed', 'INVALID-FILE-TYPE')),
                false,
            );
        }
        if (!file.mimetype) {
            return cb(
                new BadRequestException('All entries in "files" must be valid file uploads, not plain strings.'),
                false,
            );
        }
        if (file.size > maxSizeMB) {
            throw new BadRequestException(
                `File exceeds the ${maxSizeMB / 1024 / 1024} MB size limit.`,
            );
        }
        if (!file) {
            throw new BadRequestException(
                'No file provided. Send a multipart/form-data request with a "file" field.',
            );
        }
        cb(null, true);
    },
});

export const ImagesUploadInterceptor = (
    fieldName = 'file',
    maxSizeMB = 2,
    allowedTypes: string[] = ['image/jpeg', 'image/png'],
    maxCount = 1,
) => {
    return maxCount === 1
        ? FileInterceptor(fieldName, multerOptionsImages(maxSizeMB, allowedTypes, maxCount))
        : FilesInterceptor(fieldName, maxCount, multerOptionsImages(maxSizeMB, allowedTypes, maxCount));
}
