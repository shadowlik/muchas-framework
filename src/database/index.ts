import mongoose from 'mongoose';

interface DatabaseOptions {
    uri: string;
};

export = class Database {
    connectionUrl?: string;

    /**
     * Creates an instance of Database.
     * @param {DatabaseOptions} options
     */
    constructor(options: DatabaseOptions) {
        this.connectionUrl = options.uri;
    }

    async connect(): Promise<mongoose.Mongoose> {
        try {

            // Avoid deprecated warnings
            mongoose.set('useCreateIndex', true);

            await mongoose.connect(this.connectionUrl, { useNewUrlParser: true });

            return mongoose;
        } catch (error) {
            const { name, message } = error;

            if (name) {
                throw Error(`Database error: ${name} - ${message}`);
            }

            throw Error(error);
        }
    }
};
