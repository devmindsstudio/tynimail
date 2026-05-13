import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards, NotFoundException, UnprocessableEntityException, ConflictException, Logger, HttpException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { CreateDomainDto } from "@/dto/request/domain";
import { DomainService } from "./domain.service";
import { CurrentUser } from "@/decorators";
import { PostmarkService } from "../postmark";
import { success } from "@/responses";
import { AuthGuard } from "@/guards";

@ApiTags('Domains')
@Controller('domains')
export class DomainController {
    private readonly logger = new Logger(DomainController.name);

    constructor(private readonly domainService: DomainService, private readonly postmarkService: PostmarkService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all domains', description: 'Retrieve all domains for the authenticated user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Domains retrieved successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Invalid or missing token' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async getDomains(@CurrentUser('sub') userId: string) {
        const domains = await this.domainService.getDomainsByUserId(userId);
        return success('Domains retrieved successfully', { domains });
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify domain',
        description: 'If domain not in DB: add in Postmark and DB, fetch DNS and verification status. If in DB: refresh DNS and verification status. Returns domain, DNS records, and verified flag.'
    })
    @ApiBody({ type: CreateDomainDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Domain and DNS records returned' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Domain already added to another account' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async verifyDomain(@Body() dto: CreateDomainDto, @CurrentUser('sub') userId: string) {
        try {
            return await this.verifyDomainInternal(dto, userId);
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            this.logger.warn(`Domain verify failed for user ${userId}: ${err instanceof Error ? err.message : String(err)}`);
            throw new UnprocessableEntityException(
                'We couldn\'t verify the domain right now. Please check the domain name (use a custom domain like mail.yoursite.com, not a public one like gmail.com) and try again. If the problem persists, contact support.',
            );
        }
    }

    private async verifyDomainInternal(dto: CreateDomainDto, userId: string) {
        const { domain } = dto;
        let record = await this.domainService.findDomainByName(domain, userId);
        if (!record) {
            try {
                const postmarkResponse = await this.postmarkService.createDomainIdentity(domain);
                const dns = this.postmarkService.extractDnsFromPostmarkDomain(postmarkResponse);
                const postmarkId = postmarkResponse?.ID ?? postmarkResponse?.id;
                if (postmarkId == null) {
                    throw new UnprocessableEntityException('We received an invalid response from the email provider. Please try again.');
                }
                record = await this.domainService.createDomain(userId, {
                    domain_name: domain,
                    postmark_domain_id: Number(postmarkId),
                    dkim_host: dns.dkim_host,
                    dkim_value: dns.dkim_value,
                    return_path_cname_name: dns.return_path_cname_name,
                    return_path_cname_value: dns.return_path_cname_value,
                    is_verified: false,
                });
            } catch (err) {
                const res = err instanceof UnprocessableEntityException ? err.getResponse() : null;
                const msg = typeof res === 'string' ? res : (res && typeof res === 'object' && 'message' in res ? (res as { message: string }).message : '');
                if (typeof msg === 'string' && /already exists|domain already exists/i.test(msg)) {
                    let data: any;
                    try {
                        data = await this.postmarkService.getVerifiedDomainByName(domain);
                    } catch {
                        data = await this.postmarkService.findDomainByNameFromList(domain);
                    }
                    if (!data || !(data.ID ?? data.Domain?.ID ?? data.DKIMHost ?? data.DKIMPendingHost ?? data.DKIMValue ?? data.DKIMPendingTextValue)) {
                        throw err;
                    }
                    const id = data.ID ?? data.Domain?.ID ?? 0;
                    const dns = this.postmarkService.extractDnsFromPostmarkDomain(data);
                    try {
                        record = await this.domainService.createDomain(userId, {
                            domain_name: domain,
                            postmark_domain_id: id,
                            dkim_host: dns.dkim_host,
                            dkim_value: dns.dkim_value,
                            return_path_cname_name: dns.return_path_cname_name,
                            return_path_cname_value: dns.return_path_cname_value,
                            is_verified: false,
                        });
                    } catch (dbErr: any) {
                        if (dbErr?.code === '23505' || dbErr?.constraint) {
                            throw new ConflictException('This domain is already added to another account.');
                        }
                        throw dbErr;
                    }
                } else {
                    throw err;
                }
            }
        }
        let data: any;
        if (record.postmark_domain_id) {
            try {
                data = await this.postmarkService.getDomainById(record.postmark_domain_id);
            } catch (err) {
                this.logger.warn(`getDomainById failed for postmark_domain_id ${record.postmark_domain_id}: ${err instanceof Error ? err.message : String(err)}`);
                data = null;
            }
        } else {
            try {
                data = await this.postmarkService.getVerifiedDomainByName(record.domain_name);
            } catch {
                data = await this.postmarkService.findDomainByNameFromList(record.domain_name);
            }
        }
        if (data) {
            const dnsFromPostmark = this.postmarkService.extractDnsFromPostmarkDomain(data);
            if (dnsFromPostmark.dkim_host || dnsFromPostmark.dkim_value || dnsFromPostmark.return_path_cname_name || dnsFromPostmark.return_path_cname_value) {
                const updated = await this.domainService.updateDomain(record.id, {
                    dkim_host: dnsFromPostmark.dkim_host || null,
                    dkim_value: dnsFromPostmark.dkim_value || null,
                    return_path_cname_name: dnsFromPostmark.return_path_cname_name || null,
                    return_path_cname_value: dnsFromPostmark.return_path_cname_value || null,
                    ...(data?.ID && !record.postmark_domain_id ? { postmark_domain_id: data.ID } : {}),
                });
                record = updated ?? record;
            }
        }
        const { verified } = record.postmark_domain_id
            ? await this.postmarkService.getDomainVerificationStatus(record.postmark_domain_id)
            : { verified: false };
        const updated = await this.domainService.updateDomain(record.id, {
            is_verified: verified,
            verified_at: verified ? new Date() : null,
        });
        record = updated ?? record;
        const dnsRecords = {
            dkim_host: record.dkim_host ?? '',
            dkim_value: record.dkim_value ?? null,
            return_path_cname_name: record.return_path_cname_name ?? null,
            return_path_cname_value: record.return_path_cname_value ?? null,
        };
        return success(verified ? 'Domain verified successfully' : 'Domain verification pending', {
            domain: record,
            dnsRecords,
            verified,
        });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete domain', description: 'Remove domain from Postmark and soft delete in DB' })
    @ApiParam({ name: 'id', description: 'Domain ID', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: 'Domain deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Domain not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    async deleteDomain(@Param('id') id: string, @CurrentUser('sub') userId: string) {
        const domain = await this.domainService.getDomainById(id, userId);
        if (!domain) throw new NotFoundException('Domain not found');
        if (domain.postmark_domain_id) {
            try {
                await this.postmarkService.deleteDomain(domain.postmark_domain_id);
            } catch {
            }
        }
        await this.domainService.updateDomain(id, { row_status: 0 });
        return success('Domain deleted successfully', {});
    }
}
