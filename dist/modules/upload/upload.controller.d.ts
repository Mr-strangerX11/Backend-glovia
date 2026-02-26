import { UploadService } from './upload.service';
export declare class UploadController {
    private uploadService;
    constructor(uploadService: UploadService);
    getUploadImageInfo(): {
        message: string;
    };
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    getUploadImagesInfo(): {
        message: string;
    };
    uploadImages(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
}
