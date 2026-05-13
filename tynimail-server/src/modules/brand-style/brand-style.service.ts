import { TABLES } from '@/constants';
import { UpdateBrandStyleDto } from '@/dto/request/brand-style';
import {
  BrandStyleResponseDto,
  LogoResponseDto,
  SetDefaultLogoResponseDto,
} from '@/dto/response/brand-style';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { S3Service } from './s3.service';

interface BrandStyleRow {
  id?: string;
  user_id: string;
  default_logo_id: string | null;
  company_address: string | null;
  footer_email: string | null;
  created_at: Date;
  updated_at: Date;
}

interface LogoRow {
  id: string;
  user_id: string;
  s3_key: string; // stable storage key — never changes
  filename: string;
  mime_type: string;
  size_bytes: number;
  is_default: boolean;
  created_at: Date;
}

@Injectable()
export class BrandStyleService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly s3Service: S3Service,
  ) {}

  async getUserBrandStyle(userId: string): Promise<any> {
    const style = await this.getOrCreateStyle(userId);
    const logos = await this.fetchLogosWithUrls(userId);
    return this.buildResponse(style, logos);
  }

  async updateStyle(
    userId: string,
    dto: UpdateBrandStyleDto,
  ): Promise<BrandStyleResponseDto> {
    const style = await this.getOrCreateStyle(userId);

    if (dto.defaultLogoId) {
      const logo = await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
        .where({ id: dto.defaultLogoId, user_id: userId })
        .first();

      if (!logo) {
        throw new NotFoundException(
          `Logo "${dto.defaultLogoId}" not found for this user.`,
        );
      }
    }

    const patch: Partial<BrandStyleRow> = { updated_at: new Date() };
    if (
      dto.companyAddress !== undefined ||
      dto.companyAddress !== '' ||
      dto.companyAddress !== ' ' ||
      dto.companyAddress !== null
    )
      patch.company_address = dto.companyAddress;
    if (
      dto.footerEmail !== undefined ||
      dto.footerEmail !== '' ||
      dto.footerEmail !== ' ' ||
      dto.footerEmail !== null
    )
      patch.footer_email = dto.footerEmail;
    if (dto.defaultLogoId !== undefined)
      patch.default_logo_id = dto.defaultLogoId;

    await this.knex<BrandStyleRow>(TABLES.BRAND_STYLES)
      .where({ id: style.id })
      .update(patch);

    // Keep the is_default flag on the logos table in sync
    if (dto.defaultLogoId !== undefined) {
      await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
        .where({ user_id: userId })
        .update({ is_default: false });

      if (dto.defaultLogoId) {
        await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
          .where({ id: dto.defaultLogoId, user_id: userId })
          .update({ is_default: true });
      }
    }

    const updated = await this.getOrCreateStyle(userId);
    const logos = await this.fetchLogosWithUrls(userId);
    return this.buildResponse(updated, logos);
  }

  async getLogoById(userId: string, logoId: string): Promise<any> {
    const logo = await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
      .where({ id: logoId, user_id: userId })
      .first();

    return logo;
  }

  async deleteLogo(userId: string, logoId: string): Promise<void> {
    const logo = await this.getLogoById(userId, logoId);

    // Delete from S3 first; if it fails we stop before touching the DB
    await this.s3Service.deleteFile(logo.s3_key);

    await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
      .where({ id: logoId, user_id: userId })
      .delete();

    // Clear the default FK if the deleted logo was the default
    if (logo.is_default) {
      await this.knex<BrandStyleRow>(TABLES.BRAND_STYLES)
        .where({ user_id: userId })
        .update({ default_logo_id: null, updated_at: new Date() });
    }
  }

  async setDefaultLogo(
    userId: string,
    logoId: string,
  ): Promise<SetDefaultLogoResponseDto> {
    await this.knex.transaction(async (trx) => {
      // Clear all existing defaults for this user
      await trx<LogoRow>(TABLES.BRAND_LOGOS)
        .where({ user_id: userId })
        .update({ is_default: false });

      // Set the new default
      await trx<LogoRow>(TABLES.BRAND_LOGOS)
        .where({ id: logoId, user_id: userId })
        .update({ is_default: true });

      // Persist on brand_settings
      await trx<BrandStyleRow>(TABLES.BRAND_STYLES)
        .where({ user_id: userId })
        .update({ default_logo_id: logoId, updated_at: new Date() });
    });

    const updatedLogo = await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
      .where({ id: logoId })
      .first();

    const presignedUrl = await this.s3Service.getPresignedUrl(
      updatedLogo!.s3_key,
    );

    return { data: this.mapLogoRow(updatedLogo!, presignedUrl) };
  }

  async currentLogoCount(userId: string): Promise<number> {
    const currentCount: number = await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
      .where({ user_id: userId })
      .count<{ count: string }>('id as count')
      .then((rows) => parseInt((rows[0] as any).count, 10));

    return currentCount;
  }

  async uploadLogo(userId: string, file: Express.Multer.File): Promise<any> {
    const s3Key = await this.s3Service.uploadFile(file, 'logos');

    const isFirstLogo = (await this.currentLogoCount(userId)) === 0;

    const [logoRow] = await this.knex<LogoRow>(TABLES.BRAND_LOGOS)
      .insert({
        id: this.knex.fn.uuid(),
        user_id: userId,
        s3_key: s3Key,
        filename: file.originalname,
        is_default: isFirstLogo,
        created_at: this.knex.fn.now(),
      })
      .returning('*');

    if (isFirstLogo) {
      await this.getOrCreateStyle(userId); // ensure settings row exists
      await this.knex<BrandStyleRow>(TABLES.BRAND_STYLES)
        .where({ user_id: userId })
        .update({ default_logo_id: logoRow.id, updated_at: new Date() });
    } else {
      await this.knex<BrandStyleRow>(TABLES.BRAND_STYLES)
        .where({ user_id: userId })
        .update({
          default_logo_id: logoRow.id,
          updated_at: new Date(),
        });
    }

    const presignedUrl = await this.s3Service.getPresignedUrl(s3Key);

    return {
      logo: this.mapLogoRow(logoRow, presignedUrl),
      message: 'Logo uploaded successfully.',
    };
  }

  private async getOrCreateStyle(userId: string): Promise<any> {
    let row: any = await this.knex<any>(TABLES.BRAND_STYLES)
      .where({ user_id: userId })
      .first();

    if (!row) {
      const [created] = await this.knex<any>(TABLES.BRAND_STYLES)
        .insert({
          id: this.knex.fn.uuid(),
          user_id: userId,
          default_logo_id: null,
          company_address: null,
          footer_email: null,
          created_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        })
        .returning('*');
      row = created;

      return created;
    }

    return row;
  }

  private async fetchLogosWithUrls(userId: string): Promise<any> {
    const rows = await this.knex(TABLES.BRAND_LOGOS)
      .where({ user_id: userId })
      .orderBy('created_at', 'asc');

    if (rows.length === 0) return [];

    // Batch-generate pre-signed URLs in a single parallel round-trip
    const urlMap = await this.s3Service.getPresignedUrls(
      rows.map((r) => r.s3_key),
    );

    return rows.map((row) => this.mapLogoRow(row, urlMap[row.s3_key]));
  }

  private async buildResponse(
    style: BrandStyleRow,
    logos: LogoResponseDto[],
  ): Promise<BrandStyleResponseDto> {
    return {
      companyAddress: style.company_address,
      footerEmail: style.footer_email,
      defaultLogo: logos.find((l) => l.id === style.default_logo_id) ?? null,
      logos,
      updatedAt: style.updated_at.toISOString(),
    };
  }

  private mapLogoRow(row: LogoRow, presignedUrl: string): LogoResponseDto {
    return {
      id: row.id,
      url: presignedUrl,
      filename: row.filename,
      // mimeType: row.mime_type,
      // sizeBytes: row.size_bytes,
      isDefault: row.is_default,
      createdAt: row.created_at.toISOString(),
    };
  }
}
