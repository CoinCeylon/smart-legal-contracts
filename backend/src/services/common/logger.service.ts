import winston from "winston";

export default winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    exitOnError: false,
    transports: [
        new winston.transports.Console(),
    ]
});
