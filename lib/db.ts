import { Contact, Data } from "./db.d";

export const header_rows = [
    "Ссылка на сделку",	
    "ID",
//     "Дата создания",
//     "Месяц сделки",
//     "Менеджер",
//     "Имя клиента",	
//     "Наименование сделки",	
//     "Статус",	
//     "Телефон",
//     "Бюджет",	
//     "Дата синхр",
//     "Воронка",
//     "Объявление",
//     "Источник сделки"	Коммуникация	Примечание 1	Прогноз. дата визита	Оптовик	Номер заявки	Модель дивана	Форма дивана	Комплектность	Механизм	Основа (сиденье)	Стоимость ткани (основа)	Компаньон	Стоимость ткани (компаньон)	Угол	Подлокотники	Вставки	Подушки	Отстрочка (цвет)	Доп. опции	Место сделки	Откуда узнали 	Ткань в наличии	Ткань заказана	Ориентир. дата поступ. ткани	Метраж ткани	Дата выдачи ткани	Номер дивана	ФИО распил	Дата распил	Распиловка	Стоимость работы (распил)(Р)	ФИО каркасчики	Дата каркас	Каркас	Стоимость работы (каркас)(Р)	ФИО закройщицы	Дата закрой	Закройщики	Стоимость работы (закройщик)(Р)	ФИО швеи	Дата швея	Швеи	Стоимость работы (швея)(Р)	ФИО обивщики	Дата обивщик	Обивщики	Стоимость работы (обивщик)(Р)	Ор-тир. дата готов.дивана	Ор-тир. дата готов.каркаса	Ор-тир. дата готов.шитья	Кол во мест	Принял ОТК	Примечание	Подъем на этаж	Стоимость подъема	Этаж	Варианты доставки	Сумма доставки	Адрес доставки	Дата доставки	Дата самовывоза	Водители	Грузчики	Дата оплаты	Номер договора	Способ оплаты	Кредит через банк	Предоплата получена	Сумма предоплаты	Оплачено полностью	Остаток	"Доплата способ
// "	Дата доплаты	
//     "Ссылка распил"	
//     "Ссылка каркас",
//     "Ссылка закройщик"
//     "Ссылка швеи",
//     "Ссылка обивщик",
//     "Ссылка нач. производства",
//     "Ссылка бухгалтер", "Ссылка водитель",	"Стоимость работы  распил  Б 	Стоимость работы  каркас  Б 	Стоимость работы  закройщик  Б 	Стоимость работы  швея  Б 	Стоимость работы  обивщик  Б 	Примечание (распил)	Примечание (каркас)	Примечание (закройщик)	Примечание (швея)	Примечание (обивщик)	Примечание (ОТК)	Примечание для водителей	Работа оплачена распил 	Работа оплачена каркас 	Работа оплачена закройщик 	Работа оплачена швея 	
//     Работа оплачена обивщик 	Принял Закройщик	Выдал	Ссылка ткани	Ткань выдана	Поставщик (основ)	Поставщик (комп)	Ссылка заказ ткани	Дата заказа ткани	Поставщик основа	Поставщик комп	Заказан метраж основа	Заказан метраж комп	Ор дата прих ОСНОВА	Ор дата прих КОМП	Дата прихода КОМП	Дата прихода ОСНОВА	Очередность закрой	Очередность обивка	N счета ПП	Внес запись	Статья ДДС	Тип операции	Статьи PL	Тип оплаты	Дата операции	Дата начисления	Сумма	Комментарий	Сотрудник	Ткань выдана 2	Оптовик бух	Виртуальный номер	Забрал ФИО водителя	Дата вывоза с адреса	Сумма доплаты	"Дата ОТК

//     "Серия № паспорта",	
//     "Заметки",
//     "ФИО отв витр",
//     "Дата возврата",
//     "Примечание возврат",
//     "Метраж ткани комп", 
//     "Коментарий по доплате",
//     "Тут зашита формула по метражу"
]

export async function getUser(id:string){
    const response = await fetch('https://mfalladin55.amocrm.ru/api/v4/users/'+id,{
        method: "GET",
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjJkNWNhNTNkMGYzM2IxN2E0NDllNDNmOGJhMzAxNTIyYmM2MDkxOGI0ODMzOTg0MzMyODIyYzFkYWIwMmY3MzA1NjdhZTMyZWJiN2E3OTRiIn0.eyJhdWQiOiI4NTZlMmUzYy1mOWNlLTQ1MDEtYjE1Yi0zYWIyZTA0ZTczNzEiLCJqdGkiOiIyZDVjYTUzZDBmMzNiMTdhNDQ5ZTQzZjhiYTMwMTUyMmJjNjA5MThiNDgzMzk4NDMzMjgyMmMxZGFiMDJmNzMwNTY3YWUzMmViYjdhNzk0YiIsImlhdCI6MTc1ODg1MDYwMiwibmJmIjoxNzU4ODUwNjAyLCJleHAiOjE5MTY2MTEyMDAsInN1YiI6IjU5NTQyMjciLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjg4NTU2MjQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI3OGM4YzQ3NC1mYjM2LTQ0NTktYTdiOC0yMzQ2NDlhYzY2YTMiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.A7qhsMp8tgF8N7zrVwQJB6kKENKswo5xHOppfF7qDtFHc4uCayj148zsiC56Zd6__ZYLH_xsTmkGDqphjn-RNPVcjKQt7kEK7P3YosCOvb_R-F7x5whcCiGzA4lxY5Ip_DgDhILO7ghWTs1m1kw_jwfzaupQt74fBqZM6A1jSCXf7Okkdw5QWU-NCcSn09Ze40ReWmNCpYhMnrBi0OYQoGD0vbhiVHkaD4WPSLf_EjwSIbko6V--wsx1Aj9C-v1Fp18IPhit8nzTBox02rw7ZelcCjyw7okk1k_7wIWxq8DxBKRfOMSZH8M9SzD9JHOSTCy0nFaqmA5vpSSI0d-Iew",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    if(response.ok){
        const resBody:Data = await response.json();
        return resBody.name;
    } else{
        return '';
    }
}

export async function getContact(id:string){
    const response = await fetch('https://mfalladin55.amocrm.ru/api/v4/contacts/'+id,{
        method: "GET",
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjJkNWNhNTNkMGYzM2IxN2E0NDllNDNmOGJhMzAxNTIyYmM2MDkxOGI0ODMzOTg0MzMyODIyYzFkYWIwMmY3MzA1NjdhZTMyZWJiN2E3OTRiIn0.eyJhdWQiOiI4NTZlMmUzYy1mOWNlLTQ1MDEtYjE1Yi0zYWIyZTA0ZTczNzEiLCJqdGkiOiIyZDVjYTUzZDBmMzNiMTdhNDQ5ZTQzZjhiYTMwMTUyMmJjNjA5MThiNDgzMzk4NDMzMjgyMmMxZGFiMDJmNzMwNTY3YWUzMmViYjdhNzk0YiIsImlhdCI6MTc1ODg1MDYwMiwibmJmIjoxNzU4ODUwNjAyLCJleHAiOjE5MTY2MTEyMDAsInN1YiI6IjU5NTQyMjciLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjg4NTU2MjQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI3OGM4YzQ3NC1mYjM2LTQ0NTktYTdiOC0yMzQ2NDlhYzY2YTMiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.A7qhsMp8tgF8N7zrVwQJB6kKENKswo5xHOppfF7qDtFHc4uCayj148zsiC56Zd6__ZYLH_xsTmkGDqphjn-RNPVcjKQt7kEK7P3YosCOvb_R-F7x5whcCiGzA4lxY5Ip_DgDhILO7ghWTs1m1kw_jwfzaupQt74fBqZM6A1jSCXf7Okkdw5QWU-NCcSn09Ze40ReWmNCpYhMnrBi0OYQoGD0vbhiVHkaD4WPSLf_EjwSIbko6V--wsx1Aj9C-v1Fp18IPhit8nzTBox02rw7ZelcCjyw7okk1k_7wIWxq8DxBKRfOMSZH8M9SzD9JHOSTCy0nFaqmA5vpSSI0d-Iew",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    if(response.ok){
        const resBody:Contact = await response.json();
        return resBody;
    } else{
        return null;
    }
}

export async function getStatus(pipeline_id:string, id:string){
    const response = await fetch('https://mfalladin55.amocrm.ru/api/v4/leads/pipelines/3194032/statuses/'+id,{
        method: "GET",
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjJkNWNhNTNkMGYzM2IxN2E0NDllNDNmOGJhMzAxNTIyYmM2MDkxOGI0ODMzOTg0MzMyODIyYzFkYWIwMmY3MzA1NjdhZTMyZWJiN2E3OTRiIn0.eyJhdWQiOiI4NTZlMmUzYy1mOWNlLTQ1MDEtYjE1Yi0zYWIyZTA0ZTczNzEiLCJqdGkiOiIyZDVjYTUzZDBmMzNiMTdhNDQ5ZTQzZjhiYTMwMTUyMmJjNjA5MThiNDgzMzk4NDMzMjgyMmMxZGFiMDJmNzMwNTY3YWUzMmViYjdhNzk0YiIsImlhdCI6MTc1ODg1MDYwMiwibmJmIjoxNzU4ODUwNjAyLCJleHAiOjE5MTY2MTEyMDAsInN1YiI6IjU5NTQyMjciLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjg4NTU2MjQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI3OGM4YzQ3NC1mYjM2LTQ0NTktYTdiOC0yMzQ2NDlhYzY2YTMiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.A7qhsMp8tgF8N7zrVwQJB6kKENKswo5xHOppfF7qDtFHc4uCayj148zsiC56Zd6__ZYLH_xsTmkGDqphjn-RNPVcjKQt7kEK7P3YosCOvb_R-F7x5whcCiGzA4lxY5Ip_DgDhILO7ghWTs1m1kw_jwfzaupQt74fBqZM6A1jSCXf7Okkdw5QWU-NCcSn09Ze40ReWmNCpYhMnrBi0OYQoGD0vbhiVHkaD4WPSLf_EjwSIbko6V--wsx1Aj9C-v1Fp18IPhit8nzTBox02rw7ZelcCjyw7okk1k_7wIWxq8DxBKRfOMSZH8M9SzD9JHOSTCy0nFaqmA5vpSSI0d-Iew",
            "Content-Type": "application/x-www-form-urlencoded",
        }
    });
    if(response.ok){
        const resBody:Data = await response.json();
        return resBody.name;
    } else{
        return '';
    }
}

export async function getPipeline(id:string){
    const response = await fetch('https://mfalladin55.amocrm.ru/api/v4/leads/pipelines/'+id,{
        method: "GET",
        headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjJkNWNhNTNkMGYzM2IxN2E0NDllNDNmOGJhMzAxNTIyYmM2MDkxOGI0ODMzOTg0MzMyODIyYzFkYWIwMmY3MzA1NjdhZTMyZWJiN2E3OTRiIn0.eyJhdWQiOiI4NTZlMmUzYy1mOWNlLTQ1MDEtYjE1Yi0zYWIyZTA0ZTczNzEiLCJqdGkiOiIyZDVjYTUzZDBmMzNiMTdhNDQ5ZTQzZjhiYTMwMTUyMmJjNjA5MThiNDgzMzk4NDMzMjgyMmMxZGFiMDJmNzMwNTY3YWUzMmViYjdhNzk0YiIsImlhdCI6MTc1ODg1MDYwMiwibmJmIjoxNzU4ODUwNjAyLCJleHAiOjE5MTY2MTEyMDAsInN1YiI6IjU5NTQyMjciLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjg4NTU2MjQsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiI3OGM4YzQ3NC1mYjM2LTQ0NTktYTdiOC0yMzQ2NDlhYzY2YTMiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.A7qhsMp8tgF8N7zrVwQJB6kKENKswo5xHOppfF7qDtFHc4uCayj148zsiC56Zd6__ZYLH_xsTmkGDqphjn-RNPVcjKQt7kEK7P3YosCOvb_R-F7x5whcCiGzA4lxY5Ip_DgDhILO7ghWTs1m1kw_jwfzaupQt74fBqZM6A1jSCXf7Okkdw5QWU-NCcSn09Ze40ReWmNCpYhMnrBi0OYQoGD0vbhiVHkaD4WPSLf_EjwSIbko6V--wsx1Aj9C-v1Fp18IPhit8nzTBox02rw7ZelcCjyw7okk1k_7wIWxq8DxBKRfOMSZH8M9SzD9JHOSTCy0nFaqmA5vpSSI0d-Iew",
            "Content-Type": "application/x-www-form-urlencoded",
        }
    });
    if(response.ok){
        const resBody:Data = await response.json();
        return resBody.name;
    } else{
        return '';
    }
}

