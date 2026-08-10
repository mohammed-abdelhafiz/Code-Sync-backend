import { StreamClient } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error('Missing Stream API key or secret');
}

export const streamClient = new StreamClient(apiKey, apiSecret);
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData: any) => {
  try {
    await chatClient.upsertUser(userData);
    console.log('Stream user upserted successfully', userData);
  } catch (error) {
    console.log(error);
  }
};

export const deleteStreamUser = async (userId: string) => {
  try {
    await chatClient.deleteUser(userId);
    console.log('Stream user deleted successfully', userId);
  } catch (error) {
    console.log(error);
  }
};
