# HealthMonitor

## Demonstration videos:
[![web-aiot demo](https://img.youtube.com/vi/IynTBwyGj1w/0.jpg)](https://www.youtube.com/watch?v=IynTBwyGj1w)

## Available Scripts
```sh
    # Make sure docker is installed and running

    # Start locally
    docker-compose -f docker-compose.yaml up --build -d

    # For deployment
    make deploy PASSWORD=REPLACE_THIS_WITH_PASSWORD
```

## System structure
![System Structure](https://github.com/kkanho/web-aiot/blob/master/system.png?raw=true)

## Deploy sites Access
The frontend web application: [https://web-aiot.azurewebsites.net/](https://web-aiot.azurewebsites.net/)

The fastapi backend API: [https://web-aiot.azurewebsites.net/api](https://web-aiot.azurewebsites.net/api)

The MQTT Broker through WebSocket [wss://web-aiot.azurewebsites.net/ws](wss://web-aiot.azurewebsites.net/ws) and subscribe topic “vitals”

## Deploy sites simulation
IOS shortcut or python script can be used to simulate the live vitals collected from smartwatch

IOS shortcut link: [https://www.icloud.com/shortcuts/f8af79a42ab947728b2e4c25ec557352](https://www.icloud.com/shortcuts/f8af79a42ab947728b2e4c25ec557352)

```sh
    # Run the python script to simulate live vitals
    python generate_data_web_aiot.py
```

## For development
Frontend
- http://localhost:3000/

Backend
- http://localhost:8000/docs#/

MQTT Broker
- http://localhost:1883/
- http://localhost:9001/
