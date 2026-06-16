# Dev Toolbox — Project Plan

แอปเดียวที่รวม dev utility tools ไว้ในที่เดียว เปิดใช้ทุกวัน เพิ่ม tool ทีละ feature ได้
และใช้เป็น portfolio piece ตอนหางาน Go backend

---

## เป้าหมาย

- ลด friction งานประจำวันที่ต้องทำซ้ำๆ (แกะ JSON, decode JWT, test regex)
- ทำงาน **offline 100%** — ข้อมูลบริษัทไม่หลุดไปเว็บนอก
- architecture แบบ module: เพิ่ม tool ใหม่ไม่กระทบของเดิม
- โชว์สกิล Go + React ตรงตำแหน่งที่สมัคร

---

## Tech Stack

| Layer    | Tech                        | เหตุผล                                      |
|----------|-----------------------------|---------------------------------------------|
| Backend  | Go (Fiber v2)               | core logic แต่ละ feature, expose local HTTP API |
| Frontend | React + Vite + TypeScript   | UI shell + หน้าแต่ละ tool                    |
| Run      | localhost (`:8080`)         | เริ่มง่ายสุด ไม่ต้องเรียน Tauri ก่อน          |
| Desktop  | Tauri (ภายหลัง)             | ห่อเป็น desktop app เบาๆ ถ้าอยากได้           |

---

## Architecture (module-based)

แต่ละ feature เป็น module อิสระ เพิ่มตัวใหม่ไม่กระทบตัวเก่า

```
dev-toolbox/
├── backend/
│   ├── cmd/server/          # entry point
│   ├── internal/
│   │   ├── tool/            # registry กลาง: ลงทะเบียน tool
│   │   ├── jsonstruct/      # feature: JSON → Go struct
│   │   ├── jwt/             # feature: JWT decoder
│   │   └── regex/           # feature: regex tester
│   └── go.mod
└── frontend/
    ├── src/
    │   ├── tools/           # 1 tool = 1 โฟลเดอร์ (page + logic)
    │   ├── shell/           # sidebar, layout, routing
    │   └── registry.ts      # map tool → route
    └── ...
```

**หัวใจ:** tool registry — เพิ่ม feature = สร้าง module ใหม่ + ลงทะเบียน 1 บรรทัด ไม่แตะของเดิม

---

## Phases

### Phase 1 — Shell + Payload Transformer  *(สุดสัปดาห์นี้)*

- shell: sidebar เลือก tool, layout, routing
- tool registry (backend + frontend)
- feature:
  - JSON → Go struct (รองรับ nested, slice, จัดการ type)
  - JWT decoder (แสดง `exp` เทียบเวลาปัจจุบัน)
  - regex tester + เซฟ pattern ที่ใช้บ่อย
- ทำงาน offline 100%

### Phase 2 — Webhook Inspector  *(สุดสัปดาห์ถัดไป)*

- รับ webhook เข้า local, เก็บประวัติ, ดู payload/header
- stream เข้าหน้า UI ผ่าน SSE
- ปุ่ม replay request
- **portfolio piece หลัก** — โชว์ Go backend (concurrency, streaming)

### Phase 3 — SQL Tools  *(ภายหลัง ตามว่าง)*

- SQL schema → Go struct + CRUD (clean architecture: handler/service/repository)
- `EXPLAIN ANALYZE` viewer

---

## Phase 1 — ขอบเขตชัดเจน

**อยู่ใน scope:**

- JSON → Go struct (nested, slice, type mapping)
- JWT decode + แสดง expiry เทียบเวลาปัจจุบัน
- regex tester + เซฟ pattern (in-memory ก่อน)

**ไม่อยู่ใน scope v1 (กันบานปลาย):**

- Tauri packaging
- persist ลง DB / ไฟล์
- auth, multi-user, deploy

---

## Definition of Done (Phase 1)

- เปิด `localhost` แล้วสลับ 3 tool ได้
- ทั้ง 3 feature ทำงานครบแบบ offline
- เพิ่ม tool ตัวที่ 4 ได้โดยแก้แค่ registry (พิสูจน์ว่า architecture ขยายได้)

---

## ประมาณเวลา

| Phase   | เวลา            |
|---------|-----------------|
| Phase 1 | 1–2 วันหยุด      |
| Phase 2 | 2–3 วัน          |
| Phase 3 | เก็บทีหลัง        |

---

## หลักการที่ยึดตลอดโปรเจกต์

1. **เริ่มเล็ก** — ปล่อยทีละ phase อย่าทำทุก feature พร้อมกัน
2. **module อิสระ** — แต่ละ tool แยกขาด เพิ่ม/ลบได้โดยไม่พังตัวอื่น
3. **offline-first** — ปลอดภัยเรื่องข้อมูล
4. **ทำให้จบก่อนค่อยขยาย** — มี momentum สำคัญกว่า feature ครบ
