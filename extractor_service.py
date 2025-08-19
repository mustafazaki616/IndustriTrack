import io
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/extract/pdf")
@app.post("/extract/excel")
async def extract_mock(file: UploadFile = File(...)):
    # Return a mock order structure for testing
    return JSONResponse(content={
        "orders": [
            {
                "orderId": "MOCK123",
                "clientName": "Test Customer",
                "deliveryDate": "2024-08-01",
                "notes": "This is a mock order for testing.",
                "items": [
                    {"productName": "Leather Jacket", "size": "M", "quantity": 10, "color": "Black", "fabricType": "Cowhide"},
                    {"productName": "Denim Jeans", "size": "L", "quantity": 5, "color": "Blue", "fabricType": "Denim"}
                ]
            }
        ],
        "rawText": "MOCK ORDER DATA"
    }) 