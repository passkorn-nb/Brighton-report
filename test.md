# Report API Test Examples

## Endpoint

```
POST http://localhost:9200/report/generate
Content-Type: application/json
```

---

## Tuition Fee

```json
{
    "reportType": "tuitionFee",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaaa Bbbbb",
            "yearGroup": "Year 8",
            "contactName": "Mrs Ccccc Ddddd",
            "address": "xxxxxxxxxxxxxxxxx",
            "invoiceNo": "202501669",
            "invoiceDate": "06 March 2025",
            "dueDate": "02 April 2025",
            "schoolYear": "2024/2025"
        },
        "items": [
            { "description": "Tuition fee - Term 3 / Year 8", "amount": 279900 },
            { "description": "Registration fee waiver (3/3)", "amount": -75000 },
            { "description": "Credit note", "amount": -15000 },
            { "description": "Second child sibling discount (2%)", "amount": -5598 },
            { "description": "ID card charge", "amount": 500 }
        ],
        "amountInWords": "One Hundred Eighty-Four Thousand Eight Hundred And Two Baht Only",
        "totalAmount": 184802,
        "paymentMethods": {
            "referenceNo1": "101848",
            "referenceNo2": "202501669"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## Examination Fee

```json
{
    "reportType": "examFee",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaaa Bbbbb",
            "yearGroup": "Year 11",
            "contactName": "Mrs Ccccc Ddddd",
            "address": "xxxxxxxxxxxxxxxxx",
            "invoiceNo": "202504567",
            "invoiceDate": "15 January 2025",
            "dueDate": "29 January 2025",
            "schoolYear": "2024/2025"
        },
        "items": [
            { "description": "IGCSE English Language (0500)", "amount": 12500 },
            { "description": "IGCSE Mathematics (0580)", "amount": 12500 },
            { "description": "IGCSE Physics (0625)", "amount": 13000 },
            { "description": "IGCSE Chemistry (0620)", "amount": 13000 },
            { "description": "IGCSE Biology (0610)", "amount": 13000 },
            { "description": "IGCSE Thai Language (0518)", "amount": 10000 }
        ],
        "amountInWords": "Seventy-Four Thousand Baht Only",
        "totalAmount": 74000,
        "paymentMethods": {
            "referenceNo1": "101234",
            "referenceNo2": "202504567"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## School Bus

```json
{
    "reportType": "schoolBus",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaaa Bbbbb",
            "yearGroup": "Year 3",
            "contactName": "Mrs Ccccc Ddddd",
            "address": "xxxxxxxxxxxxxxxxx",
            "invoiceNo": "202507890",
            "invoiceDate": "08 September 2025",
            "dueDate": "22 September 2025",
            "schoolYear": "2025/2026"
        },
        "items": [
            { "description": "School bus service - Term 1 (Route 5 - Pattaya South, Round Trip)", "amount": 28000 },
            { "description": "Second child sibling discount (10%)", "amount": -2800 }
        ],
        "amountInWords": "Twenty-Five Thousand Two Hundred Baht Only",
        "totalAmount": 25200,
        "paymentMethods": {
            "referenceNo1": "101567",
            "referenceNo2": "202507890"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## School Trip

```json
{
    "reportType": "schoolTrip",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaaaa Bbbbb",
            "yearGroup": "Year 5",
            "contactName": "Mrs Ccccc Ddddd",
            "address": "xxxxxxxxxx",
            "invoiceNo": "202508456",
            "invoiceDate": "21 October 2025",
            "dueDate": "04 November 2025",
            "schoolYear": "2025/2026"
        },
        "items": [{ "description": "Residential trip to Doi Tung, Chiang Rai (1st - 3rd Dec 2025)", "amount": 23500 }],
        "amountInWords": "Twenty-Three Thousand Five Hundred Baht Only",
        "totalAmount": 23500,
        "paymentMethods": {
            "referenceNo1": "101323",
            "referenceNo2": "202508456"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## ECA Sport & Music

```json
{
    "reportType": "eca",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaaa Bbbbb",
            "yearGroup": "Year 2",
            "contactName": "Mrs Ccccc Ddddd",
            "address": "xxxxxxxxxxxxxxxxxxxxxxxx",
            "invoiceNo": "202506891",
            "invoiceDate": "15 September 2025",
            "dueDate": "29 September 2025",
            "schoolYear": "2025/2026"
        },
        "items": [
            { "description": "Block 1 Gymnastics - KS1 (Saturday)", "amount": 6560 },
            { "description": "Block 1 Basketball - KS1 (Monday)", "amount": 2800 },
            { "description": "Block 1 Tennis Orange Ball Class - KS1 (Friday)", "amount": 6000 },
            { "description": "Term 1 individual piano lessons (40 minutes on Thursday)", "amount": 14400 },
            { "description": "Term 1 individual piano lessons (40 minutes on Tuesday)", "amount": 14400 }
        ],
        "amountInWords": "Forty-Four Thousand One Hundred And Sixty Baht Only",
        "totalAmount": 44160,
        "paymentMethods": {
            "referenceNo1": "100887",
            "referenceNo2": "202506891"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## Holiday Camp (King's Student)

```json
{
    "reportType": "holidayCamp",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaaa Bbbbb",
            "yearGroup": "Reception",
            "contactName": "Ms Ccccc Ddddd",
            "address": "xxxxxxxxxx",
            "invoiceNo": "202503254",
            "invoiceDate": "25 April 2025",
            "dueDate": "28 April 2025",
            "schoolYear": "2024/2025"
        },
        "items": [
            { "description": "Holiday camps - full day (1 week)", "amount": 19500 },
            { "description": "Holiday camps - full day (additional week)", "amount": 18525 },
            { "description": "5% discount for early bird", "amount": -1901.25 }
        ],
        "amountInWords": "Thirty Six Thousand One Hundred And Twenty-Three Baht And Seventy-Five Satang Only",
        "totalAmount": 36123.75,
        "paymentMethods": {
            "referenceNo1": "101615",
            "referenceNo2": "202503254"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## Holiday Camp (External Student)

```json
{
    "reportType": "holidayCampExternal",
    "data": {
        "studentInfo": {
            "studentName": "Aaaaa Bbbbb",
            "contactName": "Ccccc Ddddd",
            "invoiceNo": "202503519",
            "invoiceDate": "2 May 2025",
            "dueDate": "5 May 2025",
            "schoolYear": "2024/2025"
        },
        "items": [
            { "description": "Holiday camps - full day (1 week)", "amount": 19500 },
            { "description": "Holiday camps - full day (additional week)", "amount": 18525 },
            { "description": "5% discount for early bird", "amount": -1901.25 }
        ],
        "amountInWords": "Thirty Six Thousand One Hundred Twenty Three Baht And Seventy Five Satang",
        "totalAmount": 36123.75,
        "paymentMethods": {
            "referenceNo1": "700113",
            "referenceNo2": "202503519"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## Student Activities

```json
{
    "reportType": "studentActivities",
    "data": {
        "studentInfo": {
            "studentId": "000000",
            "studentName": "Aaaa Bbbbb",
            "yearGroup": "Year 8",
            "contactName": "Ms Ccccc Ddddd",
            "address": "xxxxxxxxxxx",
            "invoiceNo": "202508125",
            "invoiceDate": "10 October 2025",
            "dueDate": "24 October 2025",
            "schoolYear": "2025/2026"
        },
        "items": [{ "description": "U13 FOBISIA Basketball Tournament (6th - 8th Nov 2025)", "amount": 3500 }],
        "amountInWords": "Three Thousand Five Hundred Baht Only",
        "totalAmount": 3500,
        "paymentMethods": {
            "referenceNo1": "100578",
            "referenceNo2": "202508125"
        },
        "signature": {
            "preparedBy": "Soraya Chalorkpunrattana",
            "authorisedOfficer": "Porntip Jarusiritrangkul"
        }
    }
}
```

---

## List Report Types

```
GET http://localhost:9200/report/types
```
