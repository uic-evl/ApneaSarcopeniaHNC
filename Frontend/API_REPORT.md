# Withings

## withings_fetch_weight

```json
{
  "method": "post",
  "request": "دریافت داده",
  "result": "ناموفق",
  "message": "داده درخواستی مورد پذیرش نیست"
}
```

## withings_fat_free_mass

```json
{
  "grpid": 5614208182,
  "attrib": 0,
  "date": 1718433837,
  "created": 1718433878,
  "modified": 1718433878,
  "category": 1,
  "deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "hash_deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "measures": [
    {
      "value": 39260,
      "type": 5,
      "unit": -3
    }
  ],
  "modelid": 13,
  "model": "Body+",
  "comment": null
}
```

## withings_fat_ratio

```json
{
  "grpid": 5614208182,
  "attrib": 0,
  "date": 1718433837,
  "created": 1718433878,
  "modified": 1718433878,
  "category": 1,
  "deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "hash_deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "measures": [
    {
      "value": 25784,
      "type": 6,
      "unit": -3
    }
  ],
  "modelid": 13,
  "model": "Body+",
  "comment": null
}
```

## withings_fat_mass_weight

```json
{
  "grpid": 5614208182,
  "attrib": 0,
  "date": 1718433837,
  "created": 1718433878,
  "modified": 1718433878,
  "category": 1,
  "deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "hash_deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "measures": [
    {
      "value": 1364,
      "type": 8,
      "unit": -2,
      "algo": 0,
      "fm": 131
    }
  ],
  "modelid": 13,
  "model": "Body+",
  "comment": null
}
```

## withings_muscle_mass

```json
{
  "grpid": 5614208182,
  "attrib": 0,
  "date": 1718433837,
  "created": 1718433878,
  "modified": 1718433878,
  "category": 1,
  "deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "hash_deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "measures": [
    {
      "value": 3724,
      "type": 76,
      "unit": -2,
      "algo": 0,
      "fm": 131
    }
  ],
  "modelid": 13,
  "model": "Body+",
  "comment": null
}
```

## withings_bone_mass

```json
{
  "grpid": 5614208182,
  "attrib": 0,
  "date": 1718433837,
  "created": 1718433878,
  "modified": 1718433878,
  "category": 1,
  "deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "hash_deviceid": "dc68cc288e798ffec68ff2a4bfe71024c926f90c",
  "measures": [
    {
      "value": 200,
      "type": 88,
      "unit": -2,
      "algo": 0,
      "fm": 131
    }
  ],
  "modelid": 13,
  "model": "Body+",
  "comment": null
}
```

# FitBit

## fitbit_fetch_heart_rate_time_series_by_date

```json
{
  "activities-heart": [
    {
      "dateTime": "2024-06-18",
      "value": {
        "customHeartRateZones": [],
        "heartRateZones": [
          {
            "caloriesOut": 551.98652,
            "max": 122,
            "min": 30,
            "minutes": 1440,
            "name": "Out of Range"
          },
          {
            "caloriesOut": 0,
            "max": 145,
            "min": 122,
            "minutes": 0,
            "name": "Fat Burn"
          },
          {
            "caloriesOut": 0,
            "max": 173,
            "min": 145,
            "minutes": 0,
            "name": "Cardio"
          },
          {
            "caloriesOut": 0,
            "max": 220,
            "min": 173,
            "minutes": 0,
            "name": "Peak"
          }
        ],
        "restingHeartRate": 76
      }
    }
  ]
}
```

## fitbit_fetch_heart_rate_time_series_by_date_range

```json
{
  "activities-heart": [
    {
      "dateTime": "2024-06-18",
      "value": {
        "customHeartRateZones": [],
        "heartRateZones": [
          {
            "caloriesOut": 553.74612,
            "max": 122,
            "min": 30,
            "minutes": 1440,
            "name": "Out of Range"
          },
          {
            "caloriesOut": 0,
            "max": 145,
            "min": 122,
            "minutes": 0,
            "name": "Fat Burn"
          },
          {
            "caloriesOut": 0,
            "max": 173,
            "min": 145,
            "minutes": 0,
            "name": "Cardio"
          },
          {
            "caloriesOut": 0,
            "max": 220,
            "min": 173,
            "minutes": 0,
            "name": "Peak"
          }
        ],
        "restingHeartRate": 76
      }
    }
  ]
}
```

## fitbit_fetch_spO2_summary_by_date

```json
{
  "dateTime": "2024-06-18",
  "value": {
    "avg": 98.5,
    "min": 97.8,
    "max": 99.3
  }
}
```

## fitbit_fetch_spO2_summary_by_date_range

```json
[
  {
    "dateTime": "2024-06-18",
    "value": {
      "avg": 98.5,
      "min": 97.8,
      "max": 99.3
    }
  }
]
```

## fitbit_fetch_sleep_log_by_date

```json
{
  "sleep": [
    {
      "dateOfSleep": "2024-06-18",
      "duration": 14760000,
      "efficiency": 91,
      "endTime": "2024-06-18T06:24:30.000",
      "infoCode": 0,
      "isMainSleep": true,
      "levels": {
        "data": [
          {
            "dateTime": "2024-06-18T02:18:00.000",
            "level": "wake",
            "seconds": 660
          },
          {
            "dateTime": "2024-06-18T02:29:00.000",
            "level": "light",
            "seconds": 1200
          },
          {
            "dateTime": "2024-06-18T02:49:00.000",
            "level": "wake",
            "seconds": 210
          },
          {
            "dateTime": "2024-06-18T02:52:30.000",
            "level": "light",
            "seconds": 1290
          },
          {
            "dateTime": "2024-06-18T03:14:00.000",
            "level": "wake",
            "seconds": 210
          },
          {
            "dateTime": "2024-06-18T03:17:30.000",
            "level": "light",
            "seconds": 270
          },
          {
            "dateTime": "2024-06-18T03:22:00.000",
            "level": "rem",
            "seconds": 3330
          },
          {
            "dateTime": "2024-06-18T04:17:30.000",
            "level": "light",
            "seconds": 540
          },
          {
            "dateTime": "2024-06-18T04:26:30.000",
            "level": "deep",
            "seconds": 1260
          },
          {
            "dateTime": "2024-06-18T04:47:30.000",
            "level": "light",
            "seconds": 750
          },
          {
            "dateTime": "2024-06-18T05:00:00.000",
            "level": "deep",
            "seconds": 1200
          },
          {
            "dateTime": "2024-06-18T05:20:00.000",
            "level": "light",
            "seconds": 240
          },
          {
            "dateTime": "2024-06-18T05:24:00.000",
            "level": "rem",
            "seconds": 960
          },
          {
            "dateTime": "2024-06-18T05:40:00.000",
            "level": "light",
            "seconds": 1230
          },
          {
            "dateTime": "2024-06-18T06:00:30.000",
            "level": "deep",
            "seconds": 690
          },
          {
            "dateTime": "2024-06-18T06:12:00.000",
            "level": "light",
            "seconds": 330
          },
          {
            "dateTime": "2024-06-18T06:17:30.000",
            "level": "wake",
            "seconds": 420
          }
        ],
        "shortData": [
          {
            "dateTime": "2024-06-18T02:36:00.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T02:40:30.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T02:44:30.000",
            "level": "wake",
            "seconds": 60
          },
          {
            "dateTime": "2024-06-18T02:54:30.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T03:19:00.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T03:21:00.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T03:28:30.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T03:50:00.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T04:44:30.000",
            "level": "wake",
            "seconds": 180
          },
          {
            "dateTime": "2024-06-18T04:53:00.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T05:28:00.000",
            "level": "wake",
            "seconds": 30
          },
          {
            "dateTime": "2024-06-18T05:52:30.000",
            "level": "wake",
            "seconds": 60
          }
        ],
        "summary": {
          "deep": {
            "count": 3,
            "minutes": 49,
            "thirtyDayAvgMinutes": 62
          },
          "light": {
            "count": 16,
            "minutes": 93,
            "thirtyDayAvgMinutes": 188
          },
          "rem": {
            "count": 5,
            "minutes": 70,
            "thirtyDayAvgMinutes": 55
          },
          "wake": {
            "count": 16,
            "minutes": 34,
            "thirtyDayAvgMinutes": 46
          }
        }
      },
      "logId": 45936165170,
      "logType": "auto_detected",
      "minutesAfterWakeup": 0,
      "minutesAsleep": 212,
      "minutesAwake": 34,
      "minutesToFallAsleep": 0,
      "startTime": "2024-06-18T02:18:00.000",
      "timeInBed": 246,
      "type": "stages"
    }
  ],
  "summary": {
    "stages": {
      "deep": 49,
      "light": 93,
      "rem": 70,
      "wake": 34
    },
    "totalMinutesAsleep": 212,
    "totalSleepRecords": 1,
    "totalTimeInBed": 246
  }
}
```

## fitbit_fetch_sleep_log_by_date_range

```json
{
  "errors": [
    {
      "errorType": "validation",
      "fieldName": "resource path",
      "message": "Invalid time series resource path: /sleep"
    }
  ]
}
```

## fitbit_fetch_body_time_series_by_date

```json
{
  "body-bmi": [
    {
      "dateTime": "2024-06-18",
      "value": "17.557884216308594"
    }
  ]
}
```

## fitbit_fetch_body_time_series_by_date_range

```json
{
  "body-bmi": [
    {
      "dateTime": "2024-06-18",
      "value": "17.557884216308594"
    }
  ]
}
```
