import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const createS3Client = (configService: ConfigService): S3Client => {
  return new S3Client({
    region: configService.get<string>('AWS_REGION', 'eu-north-1'),
  });
};
