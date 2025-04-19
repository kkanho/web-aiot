import random
import time
import requests

def generate_fake_data_and_send():
    
    while True:
        steps = 0  # init
        for _ in range(1440):  # for incrementing minutes
            # Generate normal data
            heart_rate = random.randint(60, 100)
            systolic_bp = random.randint(90, 140)
            diastolic_bp = random.randint(systolic_bp - 50, systolic_bp - 30)
            blood_pressure = f"{systolic_bp}/{diastolic_bp}"
            temperature = round(random.uniform(36.0, 37.5), 3)
            oxygen = random.randint(95, 100)
            steps += random.randint(0, 10) # incremental steps
            
            # Introduce extreme data points randomly
            if random.random() < 0.1:  # 10% chance to introduce extreme data
                heart_rate = random.choice([random.randint(30, 50), random.randint(120, 180)])

                systolic_bp = random.choice([random.randint(60, 80), random.randint(150, 200)])
                diastolic_bp = random.randint(systolic_bp - 50, systolic_bp - 30)
                blood_pressure = f"{systolic_bp}/{diastolic_bp}"
                temperature = random.choice([round(random.uniform(34.0, 35.5), 3), round(random.uniform(38.0, 40.0), 3)])
                oxygen = random.choice([random.randint(80, 90), random.randint(101, 105)])
                steps += random.choice([random.randint(0, 5), random.randint(20, 100)])
            
            record = {
                "field1": heart_rate,  
                "field2": blood_pressure,  
                "field3": temperature,  
                "field4": oxygen,  
                "field5": steps  
            }
            
            # Send data to ThinkSpeak (as storage)
            response1 = requests.post('https://api.thingspeak.com/update?api_key=FRMZ4TT7Y572BIBW', data=record)
            print(f"Sent to ThingSpeak: {response1.status_code}, {response1.text}")
            
            # Send data to The FastAPI backend as real time data
            response2 = requests.post('https://web-aiot.azurewebsites.net/api/mqtt/publish', json=record)
            print(f"Sent to Azure: {response2.status_code}, {response2.text}")
            
            time.sleep(3)

generate_fake_data_and_send()