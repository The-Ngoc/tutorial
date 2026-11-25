import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Express } from 'express';
import 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Attachment } from './entities/attachment.entity';

@Injectable()
export class AttachmentsService {
    constructor(
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
    ) { }

    async saveAttachment(
        attachableType: string,
        attachableId: string | number,
        file: Express.Multer.File,
        subFolder: string = 'avatars',
    ): Promise<Attachment> {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const ext = path.extname(file.originalname);
        const fileId = uuidv4();
        const storedFileName = `${fileId}${ext}`;
        const filePath = path.join(uploadDir, storedFileName);

        fs.writeFileSync(filePath, file.buffer);

        // Xóa file cũ của attachable này nếu đã tồn tại
        const existing = await this.attachmentRepository.findOne({
            where: {
                attachableType,
                attachableId: String(attachableId),
            },
        });

        if (existing) {
            const oldFilePath = path.join(process.cwd(), 'public', existing.url);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch {
                    // bỏ qua lỗi xóa file cũ
                }
            }
            await this.attachmentRepository.remove(existing);
        }

        const publicUrl = `/uploads/${subFolder}/${storedFileName}`;

        const attachment = this.attachmentRepository.create({
            id: fileId,
            attachableType,
            attachableId: String(attachableId),
            url: publicUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
        });

        return this.attachmentRepository.save(attachment);
    }
}
