# Verizon ThingSpace M2M API Documentation

Complete reference guide for the Verizon ThingSpace Connectivity Management API for M2M/IoT device management.

**Base URL:** `https://thingspace.verizon.com/api/`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Session Management](#session-management)
3. [Device Provisioning & Management](#device-provisioning--management)
4. [Device Information & Diagnostics](#device-information--diagnostics)
5. [Device History & Usage](#device-history--usage)
6. [eUICC / eSIM Management](#euicc--esim-management)
7. [Device Groups](#device-groups)
8. [SMS Messaging](#sms-messaging)
9. [Callback Management](#callback-management)
10. [Account Management](#account-management)
11. [Triggers (Automation)](#triggers-automation)
12. [Global IoT / Multi-Carrier](#global-iot--multi-carrier)
13. [Device Identifiers](#device-identifiers)
14. [Error Handling](#error-handling)

---

## Authentication

ThingSpace uses a **two-step authentication** process:

### Step 1: Get OAuth2 Access Token

**Endpoint:** `POST /api/ts/v1/oauth2/token`

**Request:**
```bash
curl -X POST "https://thingspace.verizon.com/api/ts/v1/oauth2/token" \
  -H "Authorization: Basic BASE64_ENCODED_CLIENT_ID_AND_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

**Note:** Base64 encode `client_id:client_secret`

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "m2m"
}
```

**Token Validity:** 1 hour (3600 seconds)

---

### Step 2: Get M2M Session Token

**Endpoint:** `POST /api/m2m/v1/session/login`

**Request:**
```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/session/login" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_m2m_username",
    "password": "your_m2m_password"
  }'
```

**Response:**
```json
{
  "sessionToken": "bcce3ea6-fe4f-4952-bacf-eadd80718e83"
}
```

**Token Validity:** Expires after 20 minutes of inactivity

---

### Standard Request Headers

All API requests require these headers:

```
Authorization: Bearer <oauth_access_token>
VZ-M2M-Token: <session_token>
Content-Type: application/json
```

---

## Session Management

### Start Session (Login)
**Endpoint:** `POST /api/m2m/v1/session/login`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/session/login" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

### End Session (Logout)
**Endpoint:** `POST /api/m2m/v1/session/logout`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/session/logout" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

### Reset Password
**Endpoint:** `POST /api/m2m/v1/session/password/reset`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/session/password/reset" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "oldPassword": "current_password",
    "newPassword": "new_password"
  }'
```

### Revoke OAuth Token
**Endpoint:** `POST /api/ts/v1/oauth2/revoke`

```bash
curl -X POST "https://thingspace.verizon.com/api/ts/v1/oauth2/revoke" \
  -H "Authorization: Basic BASE64_ENCODED_CLIENT_ID_AND_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=YOUR_ACCESS_TOKEN"
```

---

## Device Provisioning & Management

### List Devices
**Endpoint:** `POST /api/m2m/v1/devices/actions/list`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/actions/list" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "maxNumberOfDevices": 2000,
    "largestDeviceIdSeen": 0
  }'
```

**Response:**
```json
{
  "hasMoreData": true,
  "devices": [
    {
      "accountName": "0000123456-00001",
      "state": "active",
      "connected": true,
      "deviceIds": [
        {"id": "89148000005629358589", "kind": "iccid"},
        {"id": "353456789012345", "kind": "imei"},
        {"id": "8321234567", "kind": "mdn"},
        {"id": "310410123456789", "kind": "imsi"}
      ],
      "carrierInformations": [
        {
          "carrierName": "Verizon Wireless",
          "servicePlan": "59142x48526x84777",
          "state": "active"
        }
      ],
      "extendedAttributes": [
        {"key": "DeviceId", "value": "123456"}
      ],
      "ipAddress": "10.0.0.1",
      "lastConnectionDate": "2024-01-15T10:30:00Z",
      "lastActivationDate": "2023-06-01T08:00:00Z"
    }
  ]
}
```

---

### Activate Device
**Endpoint:** `POST /api/m2m/v1/devices/actions/activate`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/actions/activate" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "servicePlan": "59142x48526x84777",
    "mdnZipCode": "12345",
    "devices": [
      {
        "deviceIds": [
          {"kind": "iccid", "id": "89148000005629358589"},
          {"kind": "imei", "id": "353456789012345"}
        ]
      }
    ]
  }'
```

**Response:**
```json
{
  "requestId": "abc12345-6789-0def-ghij-klmnopqrstuv"
}
```

---

### Suspend Device
**Endpoint:** `POST /api/m2m/v1/devices/actions/suspend`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/actions/suspend" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Restore Device
**Endpoint:** `POST /api/m2m/v1/devices/actions/restore`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/actions/restore" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Deactivate Device
**Endpoint:** `POST /api/m2m/v1/devices/actions/deactivate`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/actions/deactivate" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "reasonCode": "FF",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

**Reason Codes:**
| Code | Description |
|------|-------------|
| FF | General deactivation |
| SF | Suspend with fee |
| NB | No billing |

---

### Add Devices to Account
**Endpoint:** `POST /api/m2m/v1/devices`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devicesToAdd": [
      {
        "deviceIds": [
          {"kind": "imei", "id": "353456789012345"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ]
  }'
```

---

### Delete Devices from Account
**Endpoint:** `DELETE /api/m2m/v1/devices`

```bash
curl -X DELETE "https://thingspace.verizon.com/api/m2m/v1/devices" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devicesToDelete": [
      {
        "deviceIds": [
          {"kind": "imei", "id": "353456789012345"}
        ]
      }
    ]
  }'
```

---

### Check Device Availability
**Endpoint:** `POST /api/m2m/v1/devices/availability`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/availability" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "deviceIds": [
      {"kind": "imei", "id": "353456789012345"},
      {"kind": "iccid", "id": "89148000005629358589"}
    ]
  }'
```

---

### Change Device Identifier
**Endpoint:** `POST /api/m2m/v1/devices/identifier/change`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/identifier/change" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ],
    "deviceIdsTo": [
      {"kind": "imei", "id": "999888777666555"},
      {"kind": "iccid", "id": "89148000009999999999"}
    ]
  }'
```

---

### Change Service Plan
**Endpoint:** `POST /api/m2m/v1/devices/actions/plan`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/actions/plan" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "servicePlan": "59145x48526x84777",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Set Device to Custom State
**Endpoint:** `POST /api/m2m/v1/devices/state/custom`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/state/custom" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "customStateName": "my_custom_state",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

## Device Information & Diagnostics

### Get Device Information
**Endpoint:** `GET /api/m2m/v1/devices/information`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/information?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Device Diagnostics
**Endpoint:** `GET /api/m2m/v1/devices/diagnostics`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/diagnostics?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Extended Diagnostics
**Endpoint:** `GET /api/m2m/v1/devices/extended-diagnostics`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/extended-diagnostics?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

**Response includes:**
- Signal strength (RSSI, RSRP, RSRQ)
- Cell tower information
- Network technology (LTE, 5G)
- IP address
- Connectivity status

---

## Device History & Usage

### Get Usage History
**Endpoint:** `GET /api/m2m/v1/devices/usage/history`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/usage/history?accountName=0000123456-00001&mdn=8321234567&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Aggregate Usage
**Endpoint:** `GET /api/m2m/v1/devices/usage/aggregate`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/usage/aggregate?accountName=0000123456-00001&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Connection History
**Endpoint:** `GET /api/m2m/v1/devices/connection/history`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/connection/history?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Provisioning History
**Endpoint:** `GET /api/m2m/v1/devices/provisioning/history`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/provisioning/history?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

## Device Reachability Monitoring

### Start Reachability Monitoring
**Endpoint:** `POST /api/m2m/v1/devices/reachability/monitor`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/reachability/monitor" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "monitorExpirationTime": "2024-12-31T23:59:59Z",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Stop Reachability Monitoring
**Endpoint:** `POST /api/m2m/v1/devices/reachability/stop`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/reachability/stop" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Get Active Reachability Monitors
**Endpoint:** `GET /api/m2m/v1/devices/reachability/active`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/reachability/active?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Reachability Status
**Endpoint:** `GET /api/m2m/v1/devices/reachability/status`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/reachability/status?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

## eUICC / eSIM Management

### Download Profile
**Endpoint:** `POST /api/m2m/v1/devices/profile/download`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/profile/download" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"}
        ]
      }
    ]
  }'
```

---

### Enable Profile
**Endpoint:** `POST /api/m2m/v1/devices/profile/enable`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/profile/enable" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ]
  }'
```

---

### Disable Profile
**Endpoint:** `POST /api/m2m/v1/devices/profile/disable`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/profile/disable" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ]
  }'
```

---

### Delete Profile
**Endpoint:** `POST /api/m2m/v1/devices/profile/delete`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/profile/delete" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ]
  }'
```

---

### Activate/Reactivate eSIM Profile
**Endpoint:** `POST /api/m2m/v1/devices/profile/activate`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/profile/activate" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "servicePlan": "59142x48526x84777",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ]
  }'
```

---

### Resume eSIM Profile
**Endpoint:** `POST /api/m2m/v1/devices/profile/resume`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/profile/resume" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ]
  }'
```

---

### EID Device Swap
**Endpoint:** `POST /api/m2m/v1/devices/swap/eid`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/swap/eid" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "devices": [
      {
        "deviceIds": [
          {"kind": "eid", "id": "89049032000000000000000000000001"},
          {"kind": "iccid", "id": "89148000005629358589"}
        ]
      }
    ],
    "deviceIdsTo": [
      {"kind": "eid", "id": "89049032000000000000000000000002"},
      {"kind": "iccid", "id": "89148000009999999999"}
    ]
  }'
```

---

## Device Groups

### Create Device Group
**Endpoint:** `POST /api/m2m/v1/device-groups`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/device-groups" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "groupName": "My Device Group",
    "groupDescription": "Fleet of delivery vehicles"
  }'
```

---

### Update Device Group
**Endpoint:** `PUT /api/m2m/v1/device-groups/{groupId}`

```bash
curl -X PUT "https://thingspace.verizon.com/api/m2m/v1/device-groups/abc123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "Updated Group Name",
    "devicesToAdd": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Get Device Groups
**Endpoint:** `GET /api/m2m/v1/device-groups`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/device-groups?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Device Group Information
**Endpoint:** `GET /api/m2m/v1/device-groups/{groupId}`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/device-groups/abc123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Delete Device Group
**Endpoint:** `DELETE /api/m2m/v1/device-groups/{groupId}`

```bash
curl -X DELETE "https://thingspace.verizon.com/api/m2m/v1/device-groups/abc123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

## SMS Messaging

### Send SMS
**Endpoint:** `POST /api/m2m/v1/sms/send`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/sms/send" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "smsMessage": "Hello from ThingSpace!",
    "devices": [
      {
        "deviceIds": [
          {"kind": "mdn", "id": "8321234567"}
        ]
      }
    ]
  }'
```

---

### Retrieve Received SMS
**Endpoint:** `GET /api/m2m/v1/sms/received`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/sms/received?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get SMS History
**Endpoint:** `GET /api/m2m/v1/sms/history`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/sms/history?accountName=0000123456-00001&mdn=8321234567" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Start Delivery of Queued SMS
**Endpoint:** `POST /api/m2m/v1/sms/queue/start`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/sms/queue/start" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001"
  }'
```

---

## Callback Management

### Register Callback
**Endpoint:** `POST /api/m2m/v1/callbacks`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/callbacks" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "name": "CarrierService",
    "url": "https://your-server.com/webhook/thingspace"
  }'
```

**Callback Types:**
| Name | Description |
|------|-------------|
| CarrierService | Provisioning status updates |
| SessionStatus | Device session updates |
| Usage | Usage threshold alerts |
| SMSReceived | Incoming SMS notifications |
| DeviceReachability | Reachability status changes |

---

### List Callbacks
**Endpoint:** `GET /api/m2m/v1/callbacks`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/callbacks?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Deregister Callback
**Endpoint:** `DELETE /api/m2m/v1/callbacks/{callbackId}`

```bash
curl -X DELETE "https://thingspace.verizon.com/api/m2m/v1/callbacks/abc123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

## Account Management

### Get Account Information
**Endpoint:** `GET /api/m2m/v1/account/information`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/account/information?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Service Plans
**Endpoint:** `GET /api/m2m/v1/account/service-plans`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/account/service-plans?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Lead Information
**Endpoint:** `GET /api/m2m/v1/account/lead-information`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/account/lead-information?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Custom Services and States
**Endpoint:** `GET /api/m2m/v1/account/services/custom`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/account/services/custom?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Get Registered Device SKUs
**Endpoint:** `GET /api/m2m/v1/account/device-skus`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/account/device-skus?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Upload Device Identifiers
**Endpoint:** `POST /api/m2m/v1/account/devices/identifiers`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/account/devices/identifiers" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "deviceIdentifiers": [
      {
        "imei": "353456789012345",
        "iccid": "89148000005629358589"
      }
    ]
  }'
```

---

## Triggers (Automation)

### Create Trigger
**Endpoint:** `POST /api/m2m/v1/triggers`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/triggers" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001",
    "triggerName": "Usage Alert",
    "triggerCategory": "usage",
    "threshold": "100MB"
  }'
```

---

### Get All Triggers
**Endpoint:** `GET /api/m2m/v1/triggers`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/triggers?accountName=0000123456-00001" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

### Update Trigger
**Endpoint:** `PUT /api/m2m/v1/triggers/{triggerId}`

```bash
curl -X PUT "https://thingspace.verizon.com/api/m2m/v1/triggers/abc123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerName": "Updated Usage Alert",
    "threshold": "200MB"
  }'
```

---

### Delete Trigger
**Endpoint:** `DELETE /api/m2m/v1/triggers/{triggerId}`

```bash
curl -X DELETE "https://thingspace.verizon.com/api/m2m/v1/triggers/abc123" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

## Global IoT / Multi-Carrier

### Get Global Device List
**Endpoint:** `POST /api/m2m/v1/devices/global/list`

```bash
curl -X POST "https://thingspace.verizon.com/api/m2m/v1/devices/global/list" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "0000123456-00001"
  }'
```

---

### Get Async Request Status
**Endpoint:** `GET /api/m2m/v1/devices/global/status`

```bash
curl -X GET "https://thingspace.verizon.com/api/m2m/v1/devices/global/status?requestId=abc12345-6789-0def" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -H "VZ-M2M-Token: YOUR_SESSION_TOKEN"
```

---

## Device Identifiers

ThingSpace supports multiple device identifier types:

| Kind | Description | Example |
|------|-------------|---------|
| `imei` | International Mobile Equipment Identity | 353456789012345 |
| `iccid` | Integrated Circuit Card Identifier | 89148000005629358589 |
| `mdn` | Mobile Directory Number | 8321234567 |
| `meid` | Mobile Equipment Identifier | A1000000000001 |
| `imsi` | International Mobile Subscriber Identity | 310410123456789 |
| `eid` | eUICC Identifier (eSIM) | 89049032000000000000000000000001 |

**Device ID Format:**
```json
{
  "deviceIds": [
    {"kind": "iccid", "id": "89148000005629358589"},
    {"kind": "imei", "id": "353456789012345"},
    {"kind": "mdn", "id": "8321234567"}
  ]
}
```

---

## Device States

| State | Description |
|-------|-------------|
| `preactive` | Device is provisioned but not yet activated |
| `active` | Device is active and can use the network |
| `suspend` | Device is suspended (no network access) |
| `deactive` | Device is deactivated |

---

## Error Handling

### Error Response Format
```json
{
  "errorCode": "INVALID_PARAMETER",
  "errorMessage": "The device identifier is invalid",
  "requestId": "abc12345-6789-0def-ghij-klmnopqrstuv"
}
```

### Common HTTP Status Codes
| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or expired token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Device or resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Common Error Codes
| Code | Description |
|------|-------------|
| INVALID_PARAMETER | One or more parameters are invalid |
| DEVICE_NOT_FOUND | Device does not exist in the account |
| DEVICE_ALREADY_ACTIVE | Device is already in the requested state |
| SERVICE_PLAN_NOT_FOUND | Service plan does not exist |
| ACCOUNT_NOT_FOUND | Account does not exist |
| SESSION_EXPIRED | Session token has expired |

---

## Async Operations

Many ThingSpace operations are **asynchronous**. They return a `requestId` immediately and deliver results via callback.

**Async Response:**
```json
{
  "requestId": "abc12345-6789-0def-ghij-klmnopqrstuv"
}
```

**Callback Payload:**
```json
{
  "requestId": "abc12345-6789-0def-ghij-klmnopqrstuv",
  "status": "Success",
  "deviceIds": [
    {"kind": "mdn", "id": "8321234567"}
  ]
}
```

---

## Rate Limits

- Contact Verizon for specific rate limit policies
- Implement exponential backoff when receiving 429 errors
- Cache tokens to reduce authentication calls

---

## Best Practices

1. **Cache tokens** - OAuth tokens last 60 min, session tokens last 20 min
2. **Use callbacks** - Register callbacks for async operation results
3. **Handle pagination** - Use `maxNumberOfDevices` and `largestDeviceIdSeen`
4. **Implement retries** - Use exponential backoff for transient failures
5. **Log request IDs** - Store `requestId` for troubleshooting

---

## Resources

- **Official Documentation:** https://thingspace.verizon.com/documentation/apis/connectivity-management.html
- **API Console:** https://thingspace.verizon.com/resources/documentation/connectivity/API_Console/
- **Getting Started:** https://thingspace.verizon.com/documentation/apis/connectivity-management/getting-started.html
- **API Reference:** https://thingspace.verizon.com/documentation/apis/connectivity-management/api-reference.html
