import {GoogleSpreadsheet, GoogleSpreadsheetRow} from 'google-spreadsheet';
import { JWT } from 'google-auth-library'
import creds from '../../quiet-dryad-creds.json'
import { json } from 'stream/consumers';
import { AmoExport, Lead, LeadFieldValue, Data, Contact } from '@/lib/db.d';
import { getContact, getPipeline, getStatus, getUser, header_rows } from '@/lib/db';
import { fromUnixTime, format, } from "date-fns";
import { TZDate } from "@date-fns/tz";


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
    
    let tableRow:AmoExport = {
        link: '',
        ID: 0,
        created_at: '',
        lead_month: '',
        manager: '',
        client_name: '',
        lead_name: '',
        status: '',
        phone: '',
        budget: 0,
        sync_date: '',
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
        seats_quantity: '',
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
    const rows = await sheet.getRows();
    sheet.setHeaderRow(Object.keys(tableRow));

    

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
        tableRow.created_at = format(new TZDate(Number(resBody.created_at) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
        tableRow.lead_month = format(new Date(fromUnixTime(resBody.created_at).getFullYear(), fromUnixTime(resBody.created_at).getMonth(), 1).toLocaleDateString("ru-RU"), 'dd/MM/yyyy');
        username ? tableRow.manager = username : tableRow.manager = '';
        contactname ? tableRow.client_name = contactname.name : tableRow.client_name = '';
        tableRow.lead_name = resBody.name;
        statusname ? tableRow.status = statusname : tableRow.status = '';
        phoneNumber ? tableRow.phone = phoneNumber : tableRow.phone = '';
        tableRow.budget = resBody.price;
        tableRow.sync_date = format(new Date(), 'dd/MM/yyyy'); ///исправить
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
                        tableRow.expected_visit_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Оптовик':
                    a.values.map((c)=>{
                        tableRow.wholesaler = c.value;
                    })
                    break;
                case 'Дата заявки':
                    a.values.map((c)=>{
                        tableRow.application_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
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
                        tableRow.textile_delivery = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Номер дивана':
                    a.values.map((c)=>{
                        tableRow.sofa_number = c.value;
                    })
                    break;
                case 'ФИО распил':
                    a.values.map((c)=>{
                        tableRow.fio_sawer = c.value;
                    })
                    break; 
                case 'Дата распил':
                    a.values.map((c)=>{
                        tableRow.saw_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Распиловка':
                    a.values.map((c)=>{
                        tableRow.sawing = c.value;
                    })
                    break;
                case 'Стоимость работы (распил)(Р)':
                    a.values.map((c)=>{
                        tableRow.saw_work_cost = c.value;
                    })
                    break;
                case 'ФИО каркасчики':
                    a.values.map((c)=>{
                        tableRow.fio_framer = c.value;
                    })
                    break;
                case 'Дата каркас':
                    a.values.map((c)=>{
                        tableRow.frame_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Каркас':
                    a.values.map((c)=>{
                        tableRow.frame = c.value;
                    })
                    break;
                case 'Стоимость работы (каркас)(Р)':
                    a.values.map((c)=>{
                        tableRow.frame_work_cost = c.value;
                    })
                    break;
                case 'ФИО закройщицы':
                    a.values.map((c)=>{
                        tableRow.fio_cutter = c.value;
                    })
                    break;
                case 'Дата закрой':
                    a.values.map((c)=>{
                        tableRow.cut_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Закройщики':
                    a.values.map((c)=>{
                        tableRow.cutters = c.value;
                    })
                    break;
                case 'Стоимость работы (закройщик)(Р)':
                    a.values.map((c)=>{
                        tableRow.cut_work_cost = c.value;
                    })
                    break;
                case 'ФИО швеи':
                    a.values.map((c)=>{
                        tableRow.fio_sewer = c.value;
                    })
                    break;
                case 'Дата швея':
                    a.values.map((c)=>{
                        tableRow.sewer_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Швеи':
                    a.values.map((c)=>{
                        tableRow.sewers = c.value;
                    })
                    break;
                case 'Стоимость работы (швея)(Р)':
                    a.values.map((c)=>{
                        tableRow.sewer_work_cost = c.value;
                    })
                    break;
                case 'ФИО обивщики':
                    a.values.map((c)=>{
                        tableRow.fio_upholsterer = c.value;
                    })
                    break;
                case 'Дата обивщик':
                    a.values.map((c)=>{
                        tableRow.upholsterer_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Обивщики':
                    a.values.map((c)=>{
                        tableRow.upholsterers = c.value;
                    })
                    break;
                case 'Стоимость работы (обивщик)(Р)':
                    a.values.map((c)=>{
                        tableRow.upholsterer_work_cost = c.value;
                    })
                    break;
                case 'Ор-тир. дата готов.дивана':
                    a.values.map((c)=>{
                        tableRow.expected_sofa_done = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Ор-тир. дата готов.каркаса':
                    a.values.map((c)=>{
                        tableRow.expected_frame_done = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Ор-тир. дата готов.шитья':
                    a.values.map((c)=>{
                        tableRow.expected_sewing_done = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Кол-во мест':
                    a.values.map((c)=>{
                        tableRow.seats_quantity = c.value;
                    })
                    break;
                case 'Принял ОТК':
                    a.values.map((c)=>{
                        tableRow.otk_accepted = c.value;
                    })
                    break;
                case 'Примечание':
                    a.values.map((c)=>{
                        tableRow.remark = c.value;
                    })
                    break;
                case 'Подъем на этаж':
                    a.values.map((c)=>{
                        tableRow.rise_to_floor = c.value;
                    })
                    break;
                case 'Этаж':
                    a.values.map((c)=>{
                        tableRow.floor = c.value;
                    })
                    break;
                case 'Стоимость подъема':
                    a.values.map((c)=>{
                        tableRow.rise_price = c.value;
                    })
                    break;
                case 'Варианты доставки':
                    a.values.map((c)=>{
                        tableRow.delivery_variant = c.value;
                    })
                    break;
                case 'Сумма доставки':
                    a.values.map((c)=>{
                        tableRow.delivery_cost = c.value;
                    })
                    break;
                case 'Адрес доставки':
                    a.values.map((c)=>{
                        tableRow.delivery_address = c.value;
                    })
                    break;
                case 'Дата доставки':
                    a.values.map((c)=>{
                        tableRow.delivery_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Дата самовывоза':
                    a.values.map((c)=>{
                        tableRow.pickup_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Водители':
                    a.values.map((c)=>{
                        tableRow.drivers = c.value;
                    })
                    break;
                case 'Грузчики':
                    a.values.map((c)=>{
                        tableRow.movers = c.value;
                    })
                    break;
                case 'Дата оплаты':
                    a.values.map((c)=>{
                        tableRow.pay_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Номер договора':
                    a.values.map((c)=>{
                        tableRow.contract_number = c.value;
                    })
                    break;
                case 'Способ оплаты':
                    a.values.map((c)=>{
                        tableRow.payment_method = c.value;
                    })
                    break;
                case 'Кредит через банк':
                    a.values.map((c)=>{
                        tableRow.bank_loan = c.value;
                    })
                    break;
                case 'Предоплата получена':
                    a.values.map((c)=>{
                        tableRow.prepayment_received = c.value;
                    })
                    break;
                case 'Сумма предоплаты':
                    a.values.map((c)=>{
                        tableRow.prepayment_amount = c.value;
                    })
                    break;
                case 'Оплачено полностью':
                    a.values.map((c)=>{
                        tableRow.full_payment = c.value;
                    })
                    break;
                case 'Остаток':
                    a.values.map((c)=>{
                        tableRow.balance = c.value;
                    })
                    break;
                case 'Доплата способ':
                    a.values.map((c)=>{
                        tableRow.additional_payment_method = c.value;
                    })
                    break;
                case 'Дата доплаты':
                    a.values.map((c)=>{
                        tableRow.additional_payment_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Ссылка распил':
                    a.values.map((c)=>{
                        tableRow.saw_link = c.value;
                    })
                    break;
                case 'Ссылка каркас':
                    a.values.map((c)=>{
                        tableRow.frame_link = c.value;
                    })
                    break;
                case 'Ссылка закройщик':
                    a.values.map((c)=>{
                        tableRow.cutter_link = c.value;
                    })
                    break;  
                case 'Ссылка швеи':
                    a.values.map((c)=>{
                        tableRow.sewer_link = c.value;
                    })
                    break;
                case 'Ссылка обивщик':
                    a.values.map((c)=>{
                        tableRow.upholsterer_link = c.value;
                    })
                    break;
                case 'Ссылка нач. производства':
                    a.values.map((c)=>{
                        tableRow.boss_link = c.value;
                    })
                    break;
                case 'Ссылка бухгалтер':
                    a.values.map((c)=>{
                        tableRow.accountant_link = c.value;
                    })
                    break;
                case 'Ссылка водитель':
                    a.values.map((c)=>{
                        tableRow.driver_link = c.value;
                    })
                    break;
                case 'Стоимость работы распил Б':
                    a.values.map((c)=>{
                        tableRow.saw_work_cost_b = c.value;
                    })
                    break;
                case 'Стоимость работы каркас Б':
                    a.values.map((c)=>{
                        tableRow.frame_work_cost_b = c.value;
                    })
                    break;
                case 'Стоимость работы закройщик Б':
                    a.values.map((c)=>{
                        tableRow.cut_work_cost_b = c.value;
                    })
                    break;
                case 'Стоимость работы швея Б':
                    a.values.map((c)=>{
                        tableRow.sewer_work_cost_b = c.value;
                    })
                    break;
                case 'Стоимость работы обивщик Б':
                    a.values.map((c)=>{
                        tableRow.upholsterer_work_cost_b = c.value;
                    })
                    break;
                case 'Примечание (распил)':
                    a.values.map((c)=>{
                        tableRow.note_sawer = c.value;
                    })
                    break;
                case 'Примечание (каркас)':
                    a.values.map((c)=>{
                        tableRow.note_framer = c.value;
                    })
                    break;
                case 'Примечание (закройщик)':
                    a.values.map((c)=>{
                        tableRow.note_cutter = c.value;
                    })
                    break;
                case 'Примечание (швея)':
                    a.values.map((c)=>{
                        tableRow.note_sewer = c.value;
                    })
                    break;
                case 'Примечание (обивщик)':
                    a.values.map((c)=>{
                        tableRow.note_upholsterer = c.value;
                    })
                    break;
                case 'Примечание (ОТК)':
                    a.values.map((c)=>{
                        tableRow.note_otk = c.value;
                    })
                    break;
                case 'Примечание для водителей':
                    a.values.map((c)=>{
                        tableRow.note_driver = c.value;
                    })
                    break;
                case 'Работа оплачена распил':
                    a.values.map((c)=>{
                        tableRow.work_paid_sawer = c.value;
                    })
                    break;
                case 'Работа оплачена каркас':
                    a.values.map((c)=>{
                        tableRow.work_paid_framer = c.value;
                    })
                    break;
                case 'Работа оплачена закройщик':
                    a.values.map((c)=>{
                        tableRow.work_paid_cutter = c.value;
                    })
                    break;
                case 'Работа оплачена швея':
                    a.values.map((c)=>{
                        tableRow.work_paid_sewer = c.value;
                    })
                    break;
                case 'Работа оплачена обивщик':
                    a.values.map((c)=>{
                        tableRow.work_paid_upholsterer = c.value;
                    })
                    break;
                case 'Принят Закройщик':
                    a.values.map((c)=>{
                        tableRow.accepted = c.value;
                    })
                    break;
                case 'Выдал':
                    a.values.map((c)=>{
                        tableRow.cutter = c.value;
                    })
                    break;
                case 'Ссылка ткани':
                    a.values.map((c)=>{
                        tableRow.textile_link = c.value;
                    })
                    break;
                case 'Ткань выдана':
                    a.values.map((c)=>{
                        tableRow.textile_issued = c.value;
                    })
                    break;
                case 'Поставщик (основ)':
                    a.values.map((c)=>{
                        tableRow.supplier_base = c.value;
                    })
                    break;
                case 'Поставщик (комп)':
                    a.values.map((c)=>{
                        tableRow.supplier_comp = c.value;
                    })
                    break;
                case 'Ссылка заказ ткани':
                    a.values.map((c)=>{
                        tableRow.textile_order_link = c.value;
                    })
                    break;
                case 'Дата заказ ткани':
                    a.values.map((c)=>{
                        tableRow.textile_order_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Поставщик основа':
                    a.values.map((c)=>{
                        tableRow.supplier_base_ext = c.value;
                    })
                    break;
                case 'Поставщик комп':
                    a.values.map((c)=>{
                        tableRow.supplier_comp_ext = c.value;
                    })
                    break;
                case 'Заказан метраж основа':
                    a.values.map((c)=>{
                        tableRow.footage_ordered_base = c.value;
                    })
                    break;
                case 'Заказан метраж комп':
                    a.values.map((c)=>{
                        tableRow.footage_ordered_comp = c.value;
                    })
                    break;
                case 'Ор дата прих ОСНОВА':
                    a.values.map((c)=>{
                        tableRow.expected_footage_delivery_base = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Ор дата прих КОМП':
                    a.values.map((c)=>{
                        tableRow.expected_footage_delivery_comp = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Дата прихода КОМП':
                    a.values.map((c)=>{
                        tableRow.footage_received_comp = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Дата прихода ОСНОВА':
                    a.values.map((c)=>{
                        tableRow.footage_received_base = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Очередность закрой':
                    a.values.map((c)=>{
                        tableRow.cutting_sequence = c.value;
                    })
                    break;
                case 'Очередность обивка':
                    a.values.map((c)=>{
                        tableRow.upholstery_sequence = c.value;
                    })
                    break;
                case 'N счета ПП':
                    a.values.map((c)=>{
                        tableRow.pp_invoice_number = c.value;
                    })
                    break;
                case 'Внес запись':
                    a.values.map((c)=>{
                        tableRow.entry_made = c.value;
                    })
                    break;
                case 'Статья ДДС':
                    a.values.map((c)=>{
                        tableRow.dds_article = c.value;
                    })
                    break;
                case 'Тип операции':
                    a.values.map((c)=>{
                        tableRow.operation_type = c.value;
                    })
                    break;
                case 'Статьи PL':
                    a.values.map((c)=>{
                        tableRow.pl_articles = c.value;
                    })
                    break;
                case 'Тип оплаты':
                    a.values.map((c)=>{
                        tableRow.payment_type = c.value;
                    })
                    break;
                case 'Дата операции':
                    a.values.map((c)=>{
                        tableRow.operation_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Дата начисления':
                    a.values.map((c)=>{
                        tableRow.accural_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Сумма':
                    a.values.map((c)=>{
                        tableRow.sum = c.value;
                    })
                    break;
                case 'Комментарий':
                    a.values.map((c)=>{
                        tableRow.comment = c.value;
                    })
                    break;
                case 'Сотрудник':
                    a.values.map((c)=>{
                        tableRow.employee = c.value;
                    })
                    break;
                case 'Ткань выдана 2':
                    a.values.map((c)=>{
                        tableRow.textile_issued_2 = c.value;
                    })
                    break;
                case 'Оптовик бух':
                    a.values.map((c)=>{
                        tableRow.wholesaler_accontert = c.value;
                    })
                    break;
                case 'Виртуальный номер':
                    a.values.map((c)=>{
                        tableRow.virtual_number = c.value;
                    })
                    break;
                case 'Забрал ФИО водителя':
                    a.values.map((c)=>{
                        tableRow.fio_pickup_driver = c.value;
                    })
                    break;
                case 'Дата вывоза с адреса':
                    a.values.map((c)=>{
                        tableRow.removal_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Сумма доплаты':
                    a.values.map((c)=>{
                        tableRow.surcharge_amount = c.value;
                    })
                    break;
                case 'Дата ОТК':
                    a.values.map((c)=>{
                        tableRow.otk_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Серия № паспорта':
                    a.values.map((c)=>{
                        tableRow.passport_data = c.value;
                    })
                    break;
                case 'Заметки':
                    a.values.map((c)=>{
                        tableRow.notes = c.value;
                    })
                    break;
                case 'ФИО отв витр':
                    a.values.map((c)=>{
                        tableRow.fio_accountant = c.value;
                    })
                    break;
                case 'Дата возврата':
                    a.values.map((c)=>{
                        tableRow.return_date = format(new TZDate(Number(c.value) * 1000).withTimeZone("Asia/Omsk"), 'dd/MM/yyyy');
                    })
                    break;
                case 'Примечание возврат':
                    a.values.map((c)=>{
                        tableRow.return_notes = c.value;
                    })
                    break;
                case 'Метраж ткани комп':
                    a.values.map((c)=>{
                        tableRow.textile_footage_comp = c.value;
                    })
                    break;
                case 'Коментарий по доплате':
                    a.values.map((c)=>{
                        tableRow.surcharge_comment = c.value;
                    })
                    break;
                case 'Тут зашита формула по метражу':
                    a.values.map((c)=>{
                        tableRow.return_formula = c.value;
                    })
                    break;
                default:
                    break;

                }
                
                
        });

        

        // resBody.custom_fields_values.map((a)=>{
        //     a.values.map((c)=>{
        //         resBodyValues.push(c.value);
        //     })
        // })
        let isExist = false;

        rows.map(async (f)=>{
            if(f.toObject().ID == resBody.id){
                isExist = true;
                sheet.clear(f.a1Range.replace("'Лист1'!'Лист1'", ''));
                for (var key in tableRow) {
                    f.set(key, tableRow[key as keyof typeof tableRow] || '' );
                }
            }
        })

        if(!isExist){
            const addRow = await sheet.addRow(Object.values(tableRow));
            if(addRow){
                return Response.json({ text:'Успех' })
            } else{
                return Response.json({ text:'Не успех' })
            }
        } else{
            return Response.json({ text:'Успех, значение обновлено' })
        }

        
        
    } else{
        return Response.json({ text:'Не успех' })
    }
    
    
}