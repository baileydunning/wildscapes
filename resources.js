import { Resource, databases } from "harperdb";

const HighScoresTable = databases.yahtzee.HighScores

export class HighScores extends Resource {
    static loadAsInstance = false;

    async get() {
        const results = await HighScoresTable.get();
        return {
            statusCode: 200,
            body: results,
        }
    }

    async post(target, data) {

        const record = { ...data, createdAt: new Date().toISOString() };
        
        await HighScoresTable.create(record);
        return {
            statusCode: 201,
            body: record,
        }
    }
}