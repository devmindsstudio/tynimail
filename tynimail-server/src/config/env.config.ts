export const envPath = {
    development: '.env.development',
    production: '.env.production',
    staging: '.env.staging',
    local: '.env',
}

export const envConfig = {
    isGlobal: true,
    envFilePath: envPath[process.env.NODE_ENV as keyof typeof envPath] || envPath.local,
}