module.exports = {
    // Override service name from package.json
    // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    serviceName: process.env.NODE_ENV === 'production' ?
        process.env.PROJECT_NAME : `${process.env.PROJECT_NAME}-${process.env.NODE_ENV || 'development'}`,

    // Use if APM Server requires a token
    secretToken: process.env.APM_TOKEN,

    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: process.env.APM_HOST,

    // Transaction sample
    transactionSampleRate: 1,
}