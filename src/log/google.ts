import { LoggingWinston } from "@google-cloud/logging-winston";

interface GoogleLoggerOptions {
    enabled?: boolean;
    level?: string;
    indexPrefix?: string;
    projectId?: string;
    keyFilename?: string;
}

class GoogleLogger {
    /**
   *
   * @param level
   * @param indexPrefix
   */
    transport(
        projectName: string,
        level: string,
        indexPrefix: string,
        projectId: string,
        keyFilename: string,
    ): LoggingWinston {
    // Creates a client
        const opt: any = {
            level,
            prefix: indexPrefix,
            projectId,
            serviceContext: {
                service: projectName,
            },
        };

        if (projectId) {
            opt.projectId = projectId;
            opt.keyFilename = keyFilename;
        }
        const loggingWinston = new LoggingWinston(opt);

        return loggingWinston;
    }
}

export { GoogleLogger, GoogleLoggerOptions };
