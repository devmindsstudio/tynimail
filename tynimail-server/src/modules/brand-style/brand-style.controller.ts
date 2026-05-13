import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrandStyleService } from './brand-style.service';
import {
  BrandStyleFetchResponseSuccessDto,
  BrandStylePatchResponseSuccessDto,
  BrandStyleResponseDto,
  DeleteLogoResponseDto,
  SetDefaultLogoFetchResponseDto,
  SetDefaultLogoResponseDto,
  UploadLogoResponseDto,
} from '@/dto/response/brand-style';
import { CurrentUser } from '@/decorators';
import { ImagesUploadInterceptor } from '@/interceptors';
import { AuthGuard } from '@/guards';
import { success } from '@/responses';
import { UpdateBrandStyleDto, UpdateBrandStyleFullDto } from '@/dto/request/brand-style';

@ApiTags('Brand Style')
@Controller('brand-style')
export class BrandStyleController {
  constructor(private readonly brandStyleService: BrandStyleService) {}

  @Get()
  @ApiOperation({
    summary: 'Get brand settings',
    description:
      "Returns the authenticated user's brand styles including all uploaded logos " +
      '(with pre-signed S3 URLs) and company info. Creates a default record on first call.',
  })
  @ApiOkResponse({ type: BrandStyleFetchResponseSuccessDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getSettings(
    @CurrentUser('sub') userId: string,
  ): Promise<BrandStyleResponseDto> {
    const data = await this.brandStyleService.getUserBrandStyle(userId);
    return success('Fetched brand styles successfully', { data });
  }

  @Post('logos/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    ImagesUploadInterceptor('file', 2, ['image/jpeg', 'image/png'], 1),
  )
  @ApiOperation({
    summary: 'Upload a logo',
    description:
      'Uploads a new logo to S3 and records it for the authenticated user. ' +
      'Maximum 5 logos per user. The first logo is automatically set as the default.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Logo image (PNG, JPEG, JPG, — max 2 MB)',
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: UploadLogoResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid file type, file too large, or 5-logo limit reached',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async uploadLogo(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadLogoResponseDto> {
    if ((await this.brandStyleService.currentLogoCount(userId)) >= 5) {
      throw new BadRequestException(
        `You have reached the 5 logo limit. Delete an existing logo before uploading a new one.`,
      );
    }
    return this.brandStyleService.uploadLogo(userId, file);
  }

  @Patch('logos/:logoId/set-default')
  @ApiOperation({
    summary: 'Set a logo as default',
    description:
      "Atomically sets the specified logo as the user's default, " +
      'clearing any previously set default. Only one logo can be the default at a time.',
  })
  @ApiParam({
    name: 'logoId',
    description: 'UUID of the logo to make default',
    type: String,
  })
  @ApiOkResponse({ type: SetDefaultLogoFetchResponseDto })
  @ApiNotFoundResponse({ description: 'Logo not found for this user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async setDefaultLogo(
    @CurrentUser('sub') userId: string,
    @Param('logoId', ParseUUIDPipe) logoId: string,
  ): Promise<SetDefaultLogoResponseDto> {
    const logo = await this.brandStyleService.getLogoById(userId, logoId);

    if (!logo) {
      throw new NotFoundException(`Logo "${logoId}" not found for this user.`);
    }
    const { data } = await this.brandStyleService.setDefaultLogo(
      userId,
      logoId,
    );
    return success('Default logo updated successfully', { data });
  }

  @Delete('logos/:logoId')
  @ApiOperation({
    summary: 'Delete a logo',
    description:
      'Permanently deletes the logo from S3 and the database. ' +
      'If the deleted logo was the default, the default is cleared.',
  })
  @ApiParam({
    name: 'logoId',
    description: 'UUID of the logo to delete',
    type: String,
  })
  @ApiOkResponse({ type: DeleteLogoResponseDto })
  @ApiNotFoundResponse({ description: 'Logo not found for this user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteLogo(
    @CurrentUser('sub') userId: string,
    @Param('logoId', ParseUUIDPipe) logoId: string,
  ): Promise<DeleteLogoResponseDto> {
    const logo = await this.brandStyleService.getLogoById(userId, logoId);
    if (!logo) {
      throw new NotFoundException(`Logo "${logoId}" not found for this user.`);
    }
    const data = await this.brandStyleService.deleteLogo(userId, logoId);
    return success('Deleted the selected image successfully', { data });
  }

  // PUT
  // edit company info, which is company address and footer email
  @Patch()
  @ApiOperation({
    summary: 'Update brand style',
    description:
      'Updates company address, footer email, and/or the default logo. ' +
      'All fields are optional — only provided fields are changed.',
  })
  @ApiOkResponse({ type: BrandStylePatchResponseSuccessDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiNotFoundResponse({
    description: 'Specified defaultLogoId not found for this user',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateStyle(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateBrandStyleDto,
  ): Promise<BrandStyleResponseDto> {
    const data = await this.brandStyleService.updateStyle(userId, dto);
    return success('Fetched brand styles successfully', { data });
  }

  @Patch('full')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    ImagesUploadInterceptor('files', 2, ['image/jpeg', 'image/png'], 5),
  )
  @ApiOperation({
    summary: 'Update brand style and optionally upload a logo in one request',
    description:
      'Multipart endpoint that accepts an optional logo file alongside ' +
      'company address and footer email. If a file is provided, it is uploaded ' +
      'and set as the default logo. All fields are optional.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Brand style fields with an optional logo (PNG, JPEG, JPG — max 2 MB)',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        companyAddress: { type: 'string' },
        footerEmail: { type: 'string', format: 'email' },
      },
    },
  })
  @ApiOkResponse({ type: BrandStylePatchResponseSuccessDto })
  @ApiBadRequestResponse({
    description: 'Invalid file type, file too large, or 5-logo limit reached',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateStyleFull(
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
    dto: UpdateBrandStyleFullDto,
  ): Promise<BrandStyleResponseDto> {
    let lastUploadedLogoId: string | undefined;

    if (files?.length) {
      const currentCount =
        await this.brandStyleService.currentLogoCount(userId);
      if (currentCount + files.length > 5) {
        throw new BadRequestException(
          `Uploading ${files.length} logo(s) would exceed the 5 logo limit. You currently have ${currentCount}.`,
        );
      }

      for (const file of files) {
        const uploaded = await this.brandStyleService.uploadLogo(userId, file);
        if (!uploaded) {
          throw new InternalServerErrorException(
            'Something went wrong while trying to upload the image',
          );
        }
        lastUploadedLogoId = uploaded.logo.id;
      }
    }

    // run updateStyle exactly once with all info combined
    const data = await this.brandStyleService.updateStyle(userId, {
      ...dto,
      ...(lastUploadedLogoId && { defaultLogoId: lastUploadedLogoId }),
    });

    return success('Brand style updated successfully', { data });
  }
}
