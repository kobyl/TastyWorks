export const unwrap = rawpackage => rawpackage[0];

export interface UnwrappedPackage {
    channel: string;
    data: any[];
}

export const Schema = {};
export const mapdata = data => {
    let type = data[0];
    let values = data[1];

    // The first message contains the schema of the data package.
    if(typeof type !== 'string') {
        const schema = type[1];
        type = type[0]; // type will always be a string now.
        Schema[type] = schema;
    }
    
    const schema = Schema[type];
    const schemaLen = schema.length;
    const mappedData = [];
    let currData = {};
    currData[schema[0]] = values[0];

    // The data is just sent in serial. We can loop through and just map to the incoming type.
    for(let i = 1; i < values.length; ++i) {
        const localindex = i % schemaLen;
        if(localindex === 0) {
            mappedData.push(currData);
            currData = {};
        }        

        currData[localindex] = values[i];
    }

    return {
        type,
        mappedData
    };
}
