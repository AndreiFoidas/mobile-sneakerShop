import dataStore from 'nedb-promise';

export class SneakerStore {
    constructor({ filename, autoload }) {
        this.store = dataStore({ filename, autoload });
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(sneaker) {
        let sneakerName = sneaker.name;
        if (!sneakerName) { // validation
            throw new Error('Missing properties')
        }
        return this.store.insert(sneaker);
    };

    async update(props, sneaker) {
        return this.store.update(props, sneaker);
    }

    async remove(props) {
        return this.store.remove(props);
    }
}

export default new SneakerStore({ filename: './db/sneakers.json', autoload: true });
