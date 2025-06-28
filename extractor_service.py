import re
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import pdfplumber
import pandas as pd
import io

app = FastAPI()

@app.post("/extract/pdf")
async def extract_pdf(file: UploadFile = File(...)):
    content = await file.read()
    orders = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"

    # Split by 'Order ID:' to get each order block
    order_blocks = re.split(r"Order ID:", text)
    for block in order_blocks:
        block = block.strip()
        if not block:
            continue
        block = "Order ID:" + block  # add back the split text

        # Extract fields
        order_id = re.search(r"Order ID:\s*([^\n]+?)Client Name:", block)
        client_name = re.search(r"Client Name:\s*([^\n]+?)Delivery Date:", block)
        delivery_date = re.search(r"Delivery Date:\s*([^\n]+?)Product Name", block)
        notes_match = re.search(r"Additional Notes:\s*([^\n]+?)(Order ID:|$)", block)
        notes = notes_match.group(1).strip() if notes_match else ""

        # Find the product table section
        table_match = re.search(r"Product NameSizeQuantityColorFabric Type(.*?)Additional Notes:", block)
        items = []
        if table_match:
            table_data = table_match.group(1)
            size_matches = list(re.finditer(r'[A-Z]{1,3}[0-9]{2,4}', table_data))
            for i, size_match in enumerate(size_matches):
                start = size_match.start()
                end = size_match.end()
                product_name = table_data[size_matches[i-1].end() if i > 0 else 0:start].strip()
                size = size_match.group()
                next_size_start = size_matches[i+1].start() if i+1 < len(size_matches) else len(table_data)
                rest = table_data[end:next_size_start]
                m = re.match(r'([A-Za-z]*)([0-9]+)([A-Za-z]+)([A-Za-z]+)', rest.strip())
                if m:
                    quantity = m.group(2)
                    color = m.group(3)
                    fabric_type = m.group(4)
                    items.append({
                        "productName": product_name,
                        "size": size,
                        "quantity": quantity,
                        "color": color,
                        "fabricType": fabric_type
                    })

        orders.append({
            "orderId": order_id.group(1).strip() if order_id else "",
            "clientName": client_name.group(1).strip() if client_name else "",
            "deliveryDate": delivery_date.group(1).strip() if delivery_date else "",
            "notes": notes,
            "items": items
        })

    return JSONResponse(content={"orders": orders, "rawText": text})

@app.post("/extract/excel")
async def extract_excel(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_excel(io.BytesIO(content))
    orders = df.to_dict(orient="records")
    return JSONResponse(content={"orders": orders}) 