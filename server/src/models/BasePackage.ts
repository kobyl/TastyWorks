import { Assert } from "../clientlib/Assert";
import { isArray } from "util";
import { validateSchema} from './Tickers';

export interface BasePackage {
    channel: string;
    data: any[];
}

export interface MappedData {
    type: string;
    mappedData:any;
}

export const Schema = {};
export const mapdata: (base:BasePackage) => MappedData = base => {
    const data = base.data;

    Assert(isArray(data) && data.length === 2, "Expecting data to be an array of len 2", data);
    let type = data[0];
    let values = data[1];

    // The first message contains the schema of the data package.
    if(typeof type !== 'string') {
        const schema = type[1];
        validateSchema(type[0], schema);
        type = type[0]; // type will always be a string now.
        Schema[type] = schema;
    }
    
    const schema = Schema[type];
    const schemaLen = schema.length;
    const mappedData = [];
    let currData = {};
    mappedData.push(currData);
    currData[schema[0]] = values[0];

    // The data is just sent in serial. We can loop through and just map to the incoming type.
    for(let i = 1; i < values.length; ++i) {
        const currIndex = i % schemaLen;
        if(currIndex === 0) {
            currData = {};
            mappedData.push(currData);
        }        

        currData[schema[currIndex]] = values[i];
    }

    return {
        type,
        mappedData
    };
}
