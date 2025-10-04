import {GoogleSpreadsheet} from 'google-spreadsheet';
import { JWT } from 'google-auth-library'
import creds from '../../quiet-dryad-creds.json'
import { json } from 'stream/consumers';
import { AmoExport, Lead, LeadFieldValue, Data, Contact } from '@/lib/db.d';
import { getContact, getPipeline, getStatus, getUser } from '@/lib/db';

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

    let tableRow:AmoExport = {
        link: '',
        ID: 0,
        created_at: 0,
        lead_month: '',
        manager: '',
        client_name: '',
        lead_name: '',
        status: '',
        phone: '',
        budget: 0,
        sync_date: 0,
        funnel_stage: '',
        ad_source: '',
        lead_source: '',
        communication: '',
        note_1: '',
        expected_visit_date: '',
        wholesaler: '',
        application_date: '',
        sofa_model: '',
        sofa_form: '',
        completeness: '',
        mechanism: '',
        seat_base: '',
        base_textile_cost: '',
        compaion: '',
        companion_textile_cost: '',
        corner: '',
        armrests: '',
        inserts: '',
        pillows: '',
        stitching_color: '',
        additional_options: '',
        deal_place: '',
        know_source: '',
        textile_stock: '',
        textile_order: '',
        expected_textile_delivery: '',
        textile_footage: '',
        textile_delivery: '',
        sofa_number: '',
        fio_sawer: '',
        saw_date: '',
        sawing: '',
        saw_work_cost: '',
        fio_framer: '',
        frame_date: '',
        frame: '',
        frame_work_cost: '',
        fio_cutter: '',
        cut_date: '',
        cutters: '',
        cut_work_cost: '',
        fio_sewer: '',
        sewer_date: '',
        sewers: '',
        sewer_work_cost: '',
        fio_upholsterer: '',
        upholsterer_date: '',
        upholsterers: '',
        upholsterer_work_cost: '',
        expected_sofa_done: '',
        expected_frame_done: '',
        expected_sewing_done: '',
        seats_quantity: 0,
        otk_accepted: '',
        remark: '',
        rise_to_floor: '',
        rise_price: '',
        floor: '',
        delivery_variant: '',
        delivery_cost: '',
        delivery_address: '',
        delivery_date: '',
        pickup_date: '',
        drivers: '',
        movers: '',
        pay_date: '',
        contract_number: '',
        payment_method: '',
        bank_loan: '',
        prepayment_received: '',
        prepayment_amount: '',
        full_payment: '',
        balance: '',
        additional_payment_method: '',
        additional_payment_date: '',
        saw_link: '',
        frame_link: '',
        cutter_link: '',
        sewer_link: '',
        upholsterer_link: '',
        boss_link: '',
        accountant_link: '',
        driver_link: '',
        saw_work_cost_b: '',
        frame_work_cost_b: '',
        cut_work_cost_b: '',
        sewer_work_cost_b: '',
        upholsterer_work_cost_b: '',
        note_sawer: '',
        note_framer: '',
        note_cutter: '',
        note_sewer: '',
        note_upholsterer: '',
        note_otk: '',
        note_driver: '',
        work_paid_sawer: '',
        work_paid_framer: '',
        work_paid_cutter: '',
        work_paid_sewer: '',
        work_paid_upholsterer: '',
        accepted: '',
        cutter: '',
        issued: '',
        textile_link: '',
        textile_issued: '',
        supplier_base: '',
        supplier_comp: '',
        textile_order_link: '',
        textile_order_date: '',
        supplier_base_ext: '',
        supplier_comp_ext: '',
        footage_ordered_base: '',
        footage_ordered_comp: '',
        expected_footage_delivery_base: '',
        expected_footage_delivery_comp: '',
        footage_received_base: '',
        footage_received_comp: '',
        cutting_sequence: '',
        upholstery_sequence: '',
        pp_invoice_number: '',
        entry_made: '',
        dds_article: '',
        operation_type: '',
        pl_articles: '',
        payment_type: '',
        operation_date: '',
        accural_date: '',
        sum: '',
        comment: '',
        employee: '',
        textile_issued_2: '',
        wholesaler_accontert: '',
        virtual_number: '',
        fio_pickup_driver: '',
        removal_date: '',
        surcharge_amount: '',
        otk_date: '',
        passport_data: '',
        notes: '',
        fio_accountant: '',
        return_date: '',
        return_notes: '',
        textile_footage_comp: '',
        surcharge_comment: '',
        return_formula: ''
    };

    const now = new Date();


    

    

    const response = await fetch('https://mfalladin55.amocrm.ru/api/v4/leads/' + formDataValues[0] +'?with=contacts', {
        method: "GET",
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjJkNWNhNTNkMGYzM2IxN2E0NDllNDNmOGJhMzAxNTIyYmM2MDkxOGI0ODMzOTg0MzMyODIyYzFkYWIwMmY3MzA1NjdhZTMyZWJiN2E3OTRiIn0.eyJhdWQiOiI4NTZlMmUzYy1mOWNlLTQ1MDEtYjE1Yi0zYWIyZTA0ZTczNzEiLCJqdGkiOiIyZDVjYTUzZDBmMzNiMTdhNDQ5ZTQzZjhiYTMwMTUyMmJjNjA5MThiNDgzMzk4NDMzMjgyMmMxZGFiMDJmNzMwNTY3YWUzMmViYjdhNzk0YiIsImlhdCI6MTc1ODg1MDYwMiwibmJmIjoxNzU4ODUwNjAyLCJleHAiOjE5MTY2MTEyMDAsInN1YiI6IjU5NTQyMjciLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjg4NTU2MjQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI3OGM4YzQ3NC1mYjM2LTQ0NTktYTdiOC0yMzQ2NDlhYzY2YTMiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.A7qhsMp8tgF8N7zrVwQJB6kKENKswo5xHOppfF7qDtFHc4uCayj148zsiC56Zd6__ZYLH_xsTmkGDqphjn-RNPVcjKQt7kEK7P3YosCOvb_R-F7x5whcCiGzA4lxY5Ip_DgDhILO7ghWTs1m1kw_jwfzaupQt74fBqZM6A1jSCXf7Okkdw5QWU-NCcSn09Ze40ReWmNCpYhMnrBi0OYQoGD0vbhiVHkaD4WPSLf_EjwSIbko6V--wsx1Aj9C-v1Fp18IPhit8nzTBox02rw7ZelcCjyw7okk1k_7wIWxq8DxBKRfOMSZH8M9SzD9JHOSTCy0nFaqmA5vpSSI0d-Iew",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })

    if(response.ok){
        const resBody:Lead = await response.json();
        let resBodyValues:string[] = [];

        const username = await getUser(resBody.responsible_user_id.toString());
        const contactname = await getContact(resBody._embedded.contacts[0].id.toString());
        const statusname = await getStatus(resBody.status_id.toString());
        const piplinename = await getPipeline();

        let phoneNumber;

        if(contactname != null){
            contactname.custom_fields_values.map((a)=>{
                    if(a.field_code == 'PHONE'){
                        a.values.map((c)=>{
                            phoneNumber = c.value;
                        })
                    }
                })
        }
        
        tableRow.link = '=ГИПЕРССЫЛКА("https://mfalladin55.amocrm.ru/leads/detail/'+resBody.id+'"; "Перейти")';
        tableRow.ID = resBody.id;
        tableRow.created_at = resBody.created_at; //исправить
        tableRow.lead_month = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString("ru-RU");
        username ? tableRow.manager = username : tableRow.manager = '';
        contactname ? tableRow.client_name = contactname.name : tableRow.client_name = '';
        tableRow.lead_name = resBody.name;
        statusname ? tableRow.status = statusname : tableRow.status = '';
        phoneNumber ? tableRow.phone = phoneNumber : tableRow.phone = '';
        tableRow.budget = resBody.price;
        tableRow.sync_date = Math.floor(now.getTime() / 1000); ///исправить
        piplinename ? tableRow.funnel_stage = piplinename : tableRow.funnel_stage = '';

        resBody.custom_fields_values.map((a)=>{
            switch(a.field_name){
                case 'Источник сделки':
                    a.values.map((c)=>{
                        tableRow.lead_source = c.value;
                    })
                    break;
                case 'Коммуникация':
                    a.values.map((c)=>{
                        tableRow.communication = c.value;
                    })
                    break;
                case 'Прогноз. дата визита':
                    a.values.map((c)=>{
                        tableRow.expected_visit_date = c.value;
                    })
                    break;
                case 'Оптовик':
                    a.values.map((c)=>{
                        tableRow.wholesaler = c.value;
                    })
                    break;
                case 'Дата заявки':
                    a.values.map((c)=>{
                        tableRow.application_date = c.value;
                    })
                    break;
                case 'Модель дивана':
                    a.values.map((c)=>{
                        tableRow.sofa_model = c.value;
                    })
                    break;
                case 'Форма дивана':
                    a.values.map((c)=>{
                        tableRow.sofa_form = c.value;
                    })
                    break;
                case 'Комплектность':
                    a.values.map((c)=>{
                        tableRow.completeness = c.value;
                    })
                    break;
                case 'Механизм':
                    a.values.map((c)=>{
                        tableRow.mechanism = c.value;
                    })
                    break;
                case 'Основа (сиденье)':
                    a.values.map((c)=>{
                        tableRow.seat_base = c.value;
                    })
                    break;
                case 'Стоимость ткани (основа)':
                    a.values.map((c)=>{
                        tableRow.base_textile_cost = c.value;
                    })
                    break;
                case 'Компаньон':
                    a.values.map((c)=>{
                        tableRow.compaion = c.value;
                    })
                    break;
                case 'Стоимость ткани (компаньон)':
                    a.values.map((c)=>{
                        tableRow.companion_textile_cost = c.value;
                    })
                    break;
                case 'Угол':
                    a.values.map((c)=>{
                        tableRow.corner = c.value;
                    })
                    break;
                case 'Подлокотники':
                    a.values.map((c)=>{
                        tableRow.armrests = c.value;
                    })
                    break;
                case 'Вставки':
                    a.values.map((c)=>{
                        tableRow.inserts = c.value;
                    })
                    break;
                case 'Подушки':
                    a.values.map((c)=>{
                        tableRow.pillows = c.value;
                    })
                    break;
                case 'Доп. опции':
                    a.values.map((c)=>{
                        tableRow.stitching_color = c.value;
                    })
                    break;  
                case 'Место сделки':
                    a.values.map((c)=>{
                        tableRow.deal_place = c.value;
                    })
                    break;
                case 'Откуда узнали?':
                    a.values.map((c)=>{
                        tableRow.know_source = c.value;
                    })
                    break;
                case 'Ткань в наличии':
                    a.values.map((c)=>{
                        tableRow.textile_stock = c.value;
                    })
                    break;
                case 'Ткань заказана':
                    a.values.map((c)=>{
                        tableRow.textile_order = c.value;
                    })
                    break;
                case 'Ориентир. дата поступ. ткани':
                    a.values.map((c)=>{
                        tableRow.expected_textile_delivery = c.value;
                    })
                    break;
                case 'Метраж ткани':
                    a.values.map((c)=>{
                        tableRow.textile_footage = c.value;
                    })
                    break;
                case 'Дата выдачи ткани':
                    a.values.map((c)=>{
                        tableRow.textile_delivery = c.value;
                    })
                    break;
                case 'Номер дивана':
                    a.values.map((c)=>{
                        tableRow.sofa_number = c.value;
                    })
                    break;
                }
        });

        

        // resBody.custom_fields_values.map((a)=>{
        //     a.values.map((c)=>{
        //         resBodyValues.push(c.value);
        //     })
        // })
        const addRow = await sheet.addRow(Object.values(tableRow));

        if(addRow){
            return Response.json({ text:'Успех' })
        } else{
            return Response.json({ text:'Не успех' })
        }
    } else{
        return Response.json({ text:'Не успех' })
    }
    
    
}