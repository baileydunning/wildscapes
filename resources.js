import { Resource, databases } from "harperdb";

const UsersTable = databases.wildscapes.User

// This is how we can create custom endpoints in Harper
export class Users extends Resource {
    static loadAsInstance = false;

    async get() {
        const results = await UsersTable.get();
        return {
            statusCode: 200,
            body: results,
        }
    }

    async post(target, data) {

        const record = { ...data, createdAt: new Date().toISOString() };
        
        await UsersTable.create(record);
        return {
            statusCode: 201,
            body: record,
        }
    }
}