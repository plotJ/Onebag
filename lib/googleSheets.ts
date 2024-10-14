import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SHEET_ID = '1SvW03dTyQxHaVS-1AP0CxQGzMUfE5lrmgnz-fba-Kgo'; // Replace with your actual Sheet ID

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(range: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    return response.data.values;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}