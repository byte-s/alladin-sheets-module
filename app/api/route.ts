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

    

    fetch('https://mfalladin55.amocrm.ru/api/v4/leads/'+formDataValues[0])
        .then(async res=>{
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