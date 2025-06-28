import pino, { Logger } from 'pino';

interface CustomLogger extends Logger {
  fatalExit: (message: string, ...args: any[]) => void;
}

const baseLogger = pino();

export const logger: CustomLogger = baseLogger as CustomLogger;

logger.fatalExit = (message: string, ...args: any[]) => {
  logger.fatal(message, ...args);
  process.exit(1);
};
