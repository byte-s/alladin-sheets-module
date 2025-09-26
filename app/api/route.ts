import {GoogleSpreadsheet} from 'google-spreadsheet';
import { JWT } from 'google-auth-library'
import creds from '../../quiet-dryad-creds.json'
import { json } from 'stream/consumers';

export const config = {
      api: {
        bodyParser: false, // Disable Next.js's default body parser
      },
    };

export async function POST(request: Request) {
    //const res = await request.json();
    const formData = await request.formData()

    let formDataValues = []
    for (const value of formData.values()) {
        formDataValues.push(value.toString());
    }
    //const text = formData.get('ttext') || 'ssss'

    const SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
    ];

    const jwt = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet('1TRevNsY_rlLxJf4pUqAFTKOuT1esw4ogpY6Os-bknNw', jwt);

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    

    fetch('https://mfalladin55.amocrm.ru/api/v4/leads/'+formDataValues[0],{
        method: "GET",
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjJkNWNhNTNkMGYzM2IxN2E0NDllNDNmOGJhMzAxNTIyYmM2MDkxOGI0ODMzOTg0MzMyODIyYzFkYWIwMmY3MzA1NjdhZTMyZWJiN2E3OTRiIn0.eyJhdWQiOiI4NTZlMmUzYy1mOWNlLTQ1MDEtYjE1Yi0zYWIyZTA0ZTczNzEiLCJqdGkiOiIyZDVjYTUzZDBmMzNiMTdhNDQ5ZTQzZjhiYTMwMTUyMmJjNjA5MThiNDgzMzk4NDMzMjgyMmMxZGFiMDJmNzMwNTY3YWUzMmViYjdhNzk0YiIsImlhdCI6MTc1ODg1MDYwMiwibmJmIjoxNzU4ODUwNjAyLCJleHAiOjE5MTY2MTEyMDAsInN1YiI6IjU5NTQyMjciLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjg4NTU2MjQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI3OGM4YzQ3NC1mYjM2LTQ0NTktYTdiOC0yMzQ2NDlhYzY2YTMiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.A7qhsMp8tgF8N7zrVwQJB6kKENKswo5xHOppfF7qDtFHc4uCayj148zsiC56Zd6__ZYLH_xsTmkGDqphjn-RNPVcjKQt7kEK7P3YosCOvb_R-F7x5whcCiGzA4lxY5Ip_DgDhILO7ghWTs1m1kw_jwfzaupQt74fBqZM6A1jSCXf7Okkdw5QWU-NCcSn09Ze40ReWmNCpYhMnrBi0OYQoGD0vbhiVHkaD4WPSLf_EjwSIbko6V--wsx1Aj9C-v1Fp18IPhit8nzTBox02rw7ZelcCjyw7okk1k_7wIWxq8DxBKRfOMSZH8M9SzD9JHOSTCy0nFaqmA5vpSSI0d-Iew",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    }).then(async res=>{
            if(res.ok){
                const resBody = await res.json();
                let resBodyValues = [];
                for (let vals in resBody) {
                    if (resBody.hasOwnProperty(vals)) {
                        resBodyValues.push(vals)
                    }
                }
                const addRow = await sheet.addRow(resBody);

                if(addRow){
                    return Response.json({ text:'Успех' })
                } else{
                    return Response.json({ text:'Не успех' })
                }
            }
        }).catch(()=>{
            return Response.json({ text:'Не успех' })
        })


    
    
}