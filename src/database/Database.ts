import mongoose, { Mongoose, Schema, Model, Document, Query } from 'mongoose';
import MuchasEvents from '../Events';

interface DatabaseOptions {
    uri: string;
};

export {
    Schema, Model, Document, Query
}

export default class Database {
    connectionUrl?: string;
    mongoose: Mongoose;
    models: {
        [x: string]: Model<Document>;
    } = {};

    /**
     * Creates an instance of Database.
     * @param {DatabaseOptions} options
     */
    constructor(options: DatabaseOptions) {
        this.connectionUrl = options.uri;
    }

    /**
     * Connects to the database
     *
     * @returns {Promise<mongoose.Mongoose>}
     */
    async connect(): Promise<mongoose.Mongoose> {
        try {
            MuchasEvents.debug('Connectind to database');

            // Avoid deprecated warnings
            mongoose.set('useCreateIndex', true);

            await mongoose.connect(this.connectionUrl, { useNewUrlParser: true });

            MuchasEvents.debug('Database connected');

            return this.mongoose = mongoose;
        } catch (error) {
            const { name, message } = error;

            if (name) {
                throw Error(`Database error: ${name} - ${message}`);
            }

            throw Error(error);
        }
    }

    /**
     * Add Model
     *
     * @param {string} name
     * @param {Schema} schema
     */
    addModel(name: string, schema: Schema): void {
        this.models[name] = this.mongoose.model(name, schema);
    }
};
