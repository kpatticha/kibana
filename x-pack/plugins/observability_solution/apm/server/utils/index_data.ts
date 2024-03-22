import { Client } from '@elastic/elasticsearch';

const client = new Client({
  cloud: {
    id: '',
  },
  auth: {
    username: 'elastic',
    password: 'REPLACE',
  },
});

export async function indexData(document) {
  try {
    // Index the document
    const response = await client.index({
      index: 'performance',
      document,
    });

    console.log(`Document indexed successfully with ID: ${response}`);
    return response;
  } catch (error) {
    console.error(`Error indexing document: ${error}`);
    throw error;
  }
}
