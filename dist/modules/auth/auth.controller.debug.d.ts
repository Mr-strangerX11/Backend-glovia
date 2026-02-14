import { ConfigService } from '@nestjs/config';
export declare class DebugController {
    private configService;
    constructor(configService: ConfigService);
    checkEnv(): {
        hasJwtSecret: boolean;
        jwtSecretLength: number;
        jwtSecretPreview: string;
        hasDatabaseUrl: boolean;
        nodeEnv: string;
        frontendUrl: string;
    };
}
