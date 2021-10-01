import { run, all } from "ar-gql";
import dayjs from "dayjs";
import * as fs from 'fs';

dayjs().format();

const query = `
  query($cursor: String) {
    transactions(
      tags: [
        { name: "App-Name", values: "SmartWeaveContract" }
      ]
      after: $cursor
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          block {
            timestamp
          }
        }
      }
    }
  }`;

async function queryAndParse() {
    console.log("initializing");
    let response;
    try {
        response = await all(query);
    } catch(err) {
        console.log(err);
    }
    const timeMap = [];
    const amountMap = [];
    const data = [];
    for (let i = 0; i < response.length; i++) {
        const currentTime = dayjs.unix(response[i].node.block.timestamp).format("MM/DD/YYYY");
        let foundTime = false;
        for (let x = 0; x < timeMap.length; x++) {
            if (timeMap.length && !foundTime) {
                if (timeMap[x] === currentTime && !foundTime) {
                    amountMap[x]++;
                    foundTime = true;    
                }
            }
        }
        if (!foundTime) {
            timeMap.push(currentTime);
            amountMap.push(1);
        }
    }
    for (let i = 0; i < timeMap.length; i++) {
        data.push({
            date: timeMap[i],
            tokens: amountMap[i]
        });
    }
    
    await saveToFile(data);
}

async function saveToFile(parsedData) {
    try {
        await fs.writeFile("./data.json", JSON.stringify(parsedData), function(err) {
            console.log(err);
        });
    } catch (err) {
        throw new Error(err);
    }
}

queryAndParse();